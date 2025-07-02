import { db } from './firebase-admin';
import type { Course, User, Module, Lesson } from '@/types';

// --- Firestore Collection References ---
const usersCollection = db.collection('users');
const coursesCollection = db.collection('courses');

// --- Helper to delete subcollections recursively ---
async function deleteCollection(collectionRef: FirebaseFirestore.CollectionReference, batchSize: number = 50) {
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


// --- API FUNCTIONS ---

export async function getAllUsers(): Promise<User[]> {
  try {
    const snapshot = await usersCollection.get();
    if (snapshot.empty) {
      // Seed initial users if the collection is empty, so login works on a fresh database.
      const initialUsers: User[] = [
        { id: 'admin', name: 'Admin Utama', role: 'admin', avatarUrl: 'https://placehold.co/100x100.png' },
        { id: 'member', name: 'Siswa Rajin', role: 'member', avatarUrl: 'https://placehold.co/100x100.png' },
      ];
      const batch = db.batch();
      initialUsers.forEach(user => {
        // Use the user's id field as the document ID in Firestore
        const docRef = usersCollection.doc(user.id);
        batch.set(docRef, user);
      });
      await batch.commit();
      return initialUsers;
    }
    return snapshot.docs.map(doc => doc.data() as User);
  } catch (error) {
    console.error("Error getting users:", error);
    // This can happen if credentials are not set up correctly.
    // Return empty array to avoid crashing the app.
    return [];
  }
}

export async function getAllCourses(): Promise<Course[]> {
  try {
    const snapshot = await coursesCollection.get();
    // Note: We don't fetch nested modules/lessons for the main course list
    // to optimize performance and reduce Firestore read costs.
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            title: data.title,
            description: data.description,
            instructor: data.instructor,
            price: data.price,
            imageUrl: data.imageUrl,
            modules: [], // Modules are fetched on demand in getCourseById
        } as Course;
    });
  } catch (error) {
    console.error("Error getting all courses:", error);
    return [];
  }
}

export async function getCourseById(id: string): Promise<Course | undefined> {
  try {
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

            return {
                id: moduleDoc.id,
                ...moduleData,
                lessons
            };
        })
    );

    return {
        id: courseDoc.id,
        ...courseData,
        modules
    };
  } catch (error) {
    console.error(`Error getting course by ID (${id}):`, error);
    return undefined;
  }
}

export async function createCourse(data: Omit<Course, 'id' | 'modules'>): Promise<Course> {
  // Ensure modules is not part of the data being written to the main course document
  const { modules, ...courseData } = data as Course;
  const docRef = await coursesCollection.add(courseData);
  return {
    ...courseData,
    id: docRef.id,
    modules: [],
  };
}

export async function updateCourse(id: string, data: Omit<Course, 'id' | 'modules'>): Promise<Course | null> {
    const courseRef = coursesCollection.doc(id);
    // Ensure modules is not part of the data being written to the main course document
    const { modules, ...courseData } = data as Course;
    await courseRef.update(courseData);
    const updatedCourse = await getCourseById(id);
    return updatedCourse || null;
}

export async function deleteCourse(id: string): Promise<void> {
    const courseRef = coursesCollection.doc(id);
    const modulesRef = courseRef.collection('modules');
    
    const modulesSnapshot = await modulesRef.get();
    
    // Concurrently delete all lessons within each module
    const deleteLessonsPromises = modulesSnapshot.docs.map(moduleDoc => {
        const lessonsRef = moduleDoc.ref.collection('lessons');
        return deleteCollection(lessonsRef);
    });
    await Promise.all(deleteLessonsPromises);

    // After all lessons are gone, delete all modules
    await deleteCollection(modulesRef);

    // Finally, delete the course document itself
    await courseRef.delete();
}

// --- Curriculum API Functions ---

export async function addModule(courseId: string, data: { title: string }): Promise<Module> {
    const moduleRef = await coursesCollection.doc(courseId).collection('modules').add(data);
    return { id: moduleRef.id, title: data.title, lessons: [] };
}

export async function updateModule(courseId: string, moduleId: string, data: { title: string }): Promise<Module> {
    const moduleRef = coursesCollection.doc(courseId).collection('modules').doc(moduleId);
    await moduleRef.update(data);
    const moduleSnapshot = await moduleRef.get();
    const moduleData = moduleSnapshot.data() as { title: string };
    return { id: moduleId, ...moduleData, lessons: [] }; // Lessons not needed for this response
}

export async function deleteModule(courseId: string, moduleId: string): Promise<void> {
    const moduleRef = coursesCollection.doc(courseId).collection('modules').doc(moduleId);
    // First, delete the 'lessons' subcollection within the module
    await deleteCollection(moduleRef.collection('lessons'));
    // Then, delete the module document itself
    await moduleRef.delete();
}

export async function addLesson(courseId: string, moduleId: string, data: Omit<Lesson, 'id'>): Promise<Lesson> {
    const lessonData = {...data};
    if (data.type === 'zip' || data.type === 'text') {
        lessonData.downloadable = true;
    } else {
        lessonData.downloadable = false;
    }
    
    const lessonRef = await coursesCollection.doc(courseId).collection('modules').doc(moduleId).collection('lessons').add(lessonData);
    return { ...lessonData, id: lessonRef.id };
}

export async function updateLesson(courseId: string, moduleId: string, lessonId: string, data: Omit<Lesson, 'id'>): Promise<Lesson> {
    const lessonData = {...data};
     if (data.type === 'zip' || data.type === 'text') {
        lessonData.downloadable = true;
    } else {
        lessonData.downloadable = false;
    }
    
    const lessonRef = coursesCollection.doc(courseId).collection('modules').doc(moduleId).collection('lessons').doc(lessonId);
    await lessonRef.update(lessonData);
    return { ...lessonData, id: lessonId };
}

export async function deleteLesson(courseId: string, moduleId: string, lessonId: string): Promise<void> {
    const lessonRef = coursesCollection.doc(courseId).collection('modules').doc(moduleId).collection('lessons').doc(lessonId);
    await lessonRef.delete();
}
