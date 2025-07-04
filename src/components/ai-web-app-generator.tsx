
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Server, ShieldAlert } from 'lucide-react';

export function AiWebAppGenerator() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Server className="text-primary" />
            AI Web App Generator
        </CardTitle>
        <CardDescription>
          Jelaskan ide aplikasi Anda atau berikan URL untuk dikloning, dan biarkan AI membuatkan boilerplate lengkap untuk Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
         <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-amber-500/50 rounded-lg bg-amber-500/10 text-amber-800">
            <ShieldAlert className="h-10 w-10 mb-4" />
            <h3 className="font-semibold text-lg">Fitur Dinonaktifkan Sementara</h3>
            <p className="text-center mt-2 text-sm">
                Untuk alasan keamanan dan stabilitas, fitur ini sedang dalam peninjauan dan dinonaktifkan sementara untuk mencegah potensi penulisan ulang file proyek secara tidak disengaja.
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
