'use client';

import { AiCertificateGenerator } from '@/components/ai-certificate-generator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award } from 'lucide-react';

export default function CertificateManagementPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            Manajemen Sertifikat
          </CardTitle>
          <CardDescription>
            Buat dan kelola sertifikat kelulusan untuk peserta kursus menggunakan AI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AiCertificateGenerator />
        </CardContent>
      </Card>
    </div>
  );
}
