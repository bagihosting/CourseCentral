'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpenCheck, Mail, MapPin, Phone, Loader2, Send } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getLandingPageSettings, getConfirmationContacts, getSeoSettings } from '@/lib/data';
import type { LandingPageSettings, ConfirmationContact } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function ContactPage() {
  const [settings, setSettings] = useState<LandingPageSettings | null>(null);
  const [contacts, setContacts] = useState<ConfirmationContact[]>([]);
  const [platformName, setPlatformName] = useState('Scriptify');
  const [loading, setLoading] = useState(true);

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    setSettings(getLandingPageSettings());
    setContacts(getConfirmationContacts());
    setPlatformName(getSeoSettings().platformName || 'Scriptify');
    setLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail || !formMessage) {
        toast({ title: "Gagal", description: "Harap isi semua kolom pesan.", variant: "destructive" });
        return;
    }
    
    if (contacts.length === 0) {
        toast({ title: "Gagal", description: "Admin belum mengatur nomor kontak.", variant: "destructive" });
        return;
    }

    setIsSubmitting(true);
    
    const targetWhatsapp = contacts[0].whatsapp.replace(/[^0-9]/g, '');

    const message = `
*Pesan Baru dari Halaman Kontak ${platformName}*

*Nama:* ${formName}
*Email:* ${formEmail}
-----------------------------------
*Pesan:*
${formMessage}
    `.trim();

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${targetWhatsapp}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    toast({ title: 'Membuka WhatsApp', description: 'Silakan lanjutkan percakapan Anda di WhatsApp.' });

    // Reset form
    setFormName('');
    setFormEmail('');
    setFormMessage('');
    setIsSubmitting(false);
  };
  
  if (loading || !settings) {
    return (
      <div className="bg-muted/30 min-h-screen">
         <header className="py-4 px-4 md:px-6 bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
          <div className="container mx-auto flex justify-between items-center">
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-9 w-40" />
          </div>
        </header>
         <main className="container mx-auto py-12 md:py-16 px-4">
           <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <Skeleton className="h-9 w-48 mx-auto" />
              <Skeleton className="h-5 w-full max-w-lg mx-auto mt-2" />
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                 <Skeleton className="h-6 w-40" />
                 <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                 </div>
              </div>
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="space-y-6">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            </CardContent>
           </Card>
         </main>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 min-h-screen">
      <header className="py-4 px-4 md:px-6 bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <BookOpenCheck className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold">{platformName}</span>
          </Link>
          <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
            Kembali ke Aplikasi
          </Link>
        </div>
      </header>
      <main className="container mx-auto py-12 md:py-16 px-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Hubungi Kami</CardTitle>
            <CardDescription>Kami senang mendengar dari Anda. Hubungi kami melalui detail di bawah ini atau kirimkan pesan kepada kami.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Informasi Kontak</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Mail className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Email</h4>
                    <p className="text-muted-foreground">{settings.contactEmail}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Telepon</h4>
                    <p className="text-muted-foreground">{settings.contactPhone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Alamat</h4>
                    <p className="text-muted-foreground">{settings.contactAddress}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Kirim Pesan via WhatsApp</h3>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="name">Nama</Label>
                  <Input id="name" placeholder="Nama Anda" value={formName} onChange={e => setFormName(e.target.value)} disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="email@contoh.com" value={formEmail} onChange={e => setFormEmail(e.target.value)} disabled={isSubmitting}/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Pesan</Label>
                  <Textarea id="message" placeholder="Tuliskan pesan Anda di sini..." value={formMessage} onChange={e => setFormMessage(e.target.value)} disabled={isSubmitting} />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting || contacts.length === 0}>
                  {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                      <Send className="mr-2 h-4 w-4" />
                  )}
                  Kirim via WhatsApp
                </Button>
                 {contacts.length === 0 && <p className="text-xs text-center text-destructive">Admin belum mengatur kontak.</p>}
              </form>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
