import { db, storage } from './firebase-admin';
import type { Course, User, Module, Lesson } from '@/types';

// --- Helper Functions ---

async function deleteCollection(collectionRef: FirebaseFirestore.CollectionReference, batchSize: number = 50) {
    if (!db) {
        console.warn('Firestore is not initialized. Skipping collection deletion.');
        return;
    }
    const query = collectionRef.limit(batchSize);
    let snapshot = await query.get();

    // When there are no documents left, we are done
    while(snapshot.size > 0) {
        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        snapshot = await query.get();
    }
}

async function uploadImage(dataUri: string, courseId: string): Promise<string> {
    if (!storage) {
        throw new Error("Firebase Storage belum terkonfigurasi. Pastikan FIREBASE_STORAGE_BUCKET sudah diatur.");
    }
    const bucket = storage.bucket();
    const match = dataUri.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) {
        throw new Error("URI data gambar tidak valid.");
    }
    const contentType = match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');
    const fileExtension = contentType.split('/')[1] || 'png';
    const filePath = `thumbnails/${courseId}.${fileExtension}`;
    const file = bucket.file(filePath);
    await file.save(buffer, {
        contentType: contentType,
        public: true, // Make file public by default
    });
    return file.publicUrl();
}

// --- User API Functions ---

export async function getAllUsers(): Promise<User[]> {
  if (!db) {
    console.warn("Firestore not initialized. Returning default users for login functionality.");
    return [
        { id: 'admin', name: 'Admin Utama', role: 'admin', avatarUrl: 'https://placehold.co/100x100.png' },
        { id: 'member', name: 'Siswa Rajin', role: 'member', avatarUrl: 'https://placehold.co/100x100.png' },
    ];
  }
  try {
    const usersCollection = db.collection('users');
    const snapshot = await usersCollection.get();
    if (snapshot.empty) {
      const initialUsers: User[] = [
        { id: 'admin', name: 'Admin Utama', role: 'admin', avatarUrl: 'https://placehold.co/100x100.png' },
        { id: 'member', name: 'Siswa Rajin', role: 'member', avatarUrl: 'https://placehold.co/100x100.png' },
      ];
      const batch = db.batch();
      initialUsers.forEach(user => {
        const docRef = usersCollection.doc(user.id);
        batch.set(docRef, user);
      });
      await batch.commit();
      return initialUsers;
    }
    return snapshot.docs.map(doc => doc.data() as User);
  } catch (error) {
    console.error("Error getting users:", error);
    return [];
  }
}

// --- Course API Functions ---

export async function getAllCourses(): Promise<Course[]> {
  if (!db) {
    console.warn("Firestore not initialized. Cannot fetch courses.");
    return [];
  }
  try {
    const coursesCollection = db.collection('courses');
    const snapshot = await coursesCollection.get();
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            title: data.title,
            description: data.description,
            instructor: data.instructor,
            price: data.price,
            imageUrl: data.imageUrl,
            modules: [],
        } as Course;
    });
  } catch (error) {
    console.error("Error getting all courses:", error);
    return [];
  }
}

export async function getCourseById(id: string): Promise<Course | undefined> {
  if (!db) {
    console.warn("Firestore not initialized. Cannot fetch course by ID.");
    return undefined;
  }
  try {
    const coursesCollection = db.collection('courses');
    const courseDoc = await coursesCollection.doc(id).get();
    if (!courseDoc.exists) {
      return undefined;
    }
    const courseData = courseDoc.data() as Omit<Course, 'id' | 'modules'>;
    const modulesSnapshot = await coursesCollection.doc(id).collection('modules').orderBy('title').get();
    const modules: Module[] = await Promise.all(
        modulesSnapshot.docs.map(async (moduleDoc) => {
            const moduleData = moduleDoc.data() as Omit<Module, 'id' | 'lessons'>;
            const lessonsSnapshot = await moduleDoc.ref.collection('lessons').orderBy('title').get();
            const lessons: Lesson[] = lessonsSnapshot.docs.map(lessonDoc => ({
                id: lessonDoc.id,
                ...lessonDoc.data()
            } as Lesson));
            return { id: moduleDoc.id, ...moduleData, lessons };
        })
    );
    return { id: courseDoc.id, ...courseData, modules };
  } catch (error) {
    console.error(`Error getting course by ID (${id}):`, error);
    return undefined;
  }
}

export async function createCourse(data: Omit<Course, 'id' | 'modules'>): Promise<Course> {
  if (!db) {
    throw new Error("Firestore not initialized. Cannot create course.");
  }
  const { imageUrl, ...courseCoreData } = data;
  const coursesCollection = db.collection('courses');
  const docRef = await coursesCollection.add({
    ...courseCoreData,
    imageUrl: '',
  });

  let finalImageUrl = '';
  if (imageUrl && imageUrl.startsWith('data:image')) {
    try {
      finalImageUrl = await uploadImage(imageUrl, docRef.id);
    } catch (uploadError) {
      await docRef.delete();
      throw uploadError;
    }
  } else {
    finalImageUrl = imageUrl;
  }
  await docRef.update({ imageUrl: finalImageUrl });
  return { ...courseCoreData, id: docRef.id, imageUrl: finalImageUrl, modules: [] };
}

export async function updateCourse(id: string, data: Omit<Course, 'id' | 'modules'>): Promise<Course | null> {
    if (!db) {
        throw new Error("Firestore not initialized. Cannot update course.");
    }
    const { imageUrl, ...courseData } = data;
    const courseRef = db.collection('courses').doc(id);

    let finalImageUrl = imageUrl;
    if (imageUrl && imageUrl.startsWith('data:image')) {
        finalImageUrl = await uploadImage(imageUrl, id);
    }
    
    await courseRef.update({
        ...courseData,
        imageUrl: finalImageUrl,
    });
    
    const updatedCourse = await getCourseById(id);
    return updatedCourse || null;
}

export async function deleteCourse(id: string): Promise<void> {
    if (!db) {
        throw new Error("Firestore not initialized. Cannot delete course.");
    }
    const courseRef = db.collection('courses').doc(id);
    const modulesRef = courseRef.collection('modules');
    const modulesSnapshot = await modulesRef.get();
    const deleteLessonsPromises = modulesSnapshot.docs.map(moduleDoc => deleteCollection(moduleDoc.ref.collection('lessons')));
    await Promise.all(deleteLessonsPromises);
    await deleteCollection(modulesRef);
    await courseRef.delete();
}

// --- Curriculum API Functions ---

export async function addModule(courseId: string, data: { title: string }): Promise<Module> {
    if (!db) throw new Error("Firestore not initialized.");
    const moduleRef = await db.collection('courses').doc(courseId).collection('modules').add(data);
    return { id: moduleRef.id, title: data.title, lessons: [] };
}

export async function updateModule(courseId: string, moduleId: string, data: { title: string }): Promise<Module> {
    if (!db) throw new Error("Firestore not initialized.");
    const moduleRef = db.collection('courses').doc(courseId).collection('modules').doc(moduleId);
    await moduleRef.update(data);
    const moduleSnapshot = await moduleRef.get();
    const moduleData = moduleSnapshot.data() as { title: string };
    return { id: moduleId, ...moduleData, lessons: [] };
}

export async function deleteModule(courseId: string, moduleId: string): Promise<void> {
    if (!db) throw new Error("Firestore not initialized.");
    const moduleRef = db.collection('courses').doc(courseId).collection('modules').doc(moduleId);
    await deleteCollection(moduleRef.collection('lessons'));
    await moduleRef.delete();
}

export async function addLesson(courseId: string, moduleId: string, data: Omit<Lesson, 'id'>): Promise<Lesson> {
    if (!db) throw new Error("Firestore not initialized.");
    const lessonData = {...data, downloadable: data.type === 'zip' || data.type === 'text'};
    const lessonRef = await db.collection('courses').doc(courseId).collection('modules').doc(moduleId).collection('lessons').add(lessonData);
    return { ...lessonData, id: lessonRef.id };
}

export async function updateLesson(courseId: string, moduleId: string, lessonId: string, data: Omit<Lesson, 'id'>): Promise<Lesson> {
    if (!db) throw new Error("Firestore not initialized.");
    const lessonData = {...data, downloadable: data.type === 'zip' || data.type === 'text'};
    const lessonRef = db.collection('courses').doc(courseId).collection('modules').doc(moduleId).collection('lessons').doc(lessonId);
    await lessonRef.update(lessonData);
    return { ...lessonData, id: lessonId };
}

export async function deleteLesson(courseId: string, moduleId: string, lessonId: string): Promise<void> {
    if (!db) throw new Error("Firestore not initialized.");
    await db.collection('courses').doc(courseId).collection('modules').doc(moduleId).collection('lessons').doc(lessonId).delete();
}
