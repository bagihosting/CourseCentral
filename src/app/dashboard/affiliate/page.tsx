
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function AffiliatePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="text-destructive"/>
            Fitur Dinonaktifkan
        </CardTitle>
        <CardDescription>
            Fitur afiliasi telah dihapus dari aplikasi.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Halaman ini sengaja dikosongkan untuk menjaga kebersihan kode.</p>
      </CardContent>
    </Card>
  );
}
