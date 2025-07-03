'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, Copy, Mail } from 'lucide-react';
import { generateDigitalInvitationAction } from '@/actions/ai';
import type { GenerateDigitalInvitationOutput } from '@/ai/flows/generate-digital-invitation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalStorage } from '@/hooks/use-local-storage';

function OutputField({ label, value, onCopy }: { label: string; value: string; onCopy: () => void; }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="text-base font-semibold">{label}</Label>
        <Button size="sm" variant="ghost" onClick={onCopy}>
            <Copy className="h-4 w-4 mr-2" /> Salin
        </Button>
      </div>
      <div className="p-4 rounded-md border bg-muted/50 whitespace-pre-wrap text-sm">
        {value}
      </div>
    </div>
  );
}

export function AiDigitalInvitationGenerator() {
  const [eventType, setEventType] = useLocalStorage('ai_invite_eventType', 'Pernikahan');
  const [personOneName, setPersonOneName] = useLocalStorage('ai_invite_personOne', '');
  const [personTwoName, setPersonTwoName] = useLocalStorage('ai_invite_personTwo', '');
  const [eventDate, setEventDate] = useLocalStorage('ai_invite_eventDate', '');
  const [eventTime, setEventTime] = useLocalStorage('ai_invite_eventTime', '');
  const [eventVenue, setEventVenue] = useLocalStorage('ai_invite_eventVenue', '');
  const [theme, setTheme] = useLocalStorage('ai_invite_theme', '');
  
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState<GenerateDigitalInvitationOutput | null>(null);

  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!eventType || !personOneName || !eventDate || !eventVenue || !theme) {
      toast({
        title: 'Input Diperlukan',
        description: 'Harap isi semua kolom yang wajib diisi untuk hasil terbaik.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setOutput(null);

    const result = await generateDigitalInvitationAction({
      eventType,
      personOneName,
      personTwoName,
      eventDate,
      eventTime,
      eventVenue,
      theme,
    });

    setIsLoading(false);

    if ('error' in result) {
      toast({
        title: 'Gagal Membuat Undangan',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      setOutput(result);
      toast({
        title: 'Sukses!',
        description: 'Teks undangan digital Anda telah berhasil dibuat.',
      });
    }
  };
  
  const handleCopy = (textToCopy: string, fieldName: string) => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).then(() => {
        toast({
            title: 'Tersalin!',
            description: `${fieldName} telah disalin ke clipboard.`,
        });
    }).catch(err => {
        console.error('Failed to copy: ', err);
        toast({
            title: 'Gagal Menyalin',
            description: 'Tidak dapat menyalin ke clipboard.',
            variant: 'destructive',
        });
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Mail className="text-primary" />
            AI Generator Undangan Digital
        </CardTitle>
        <CardDescription>
          Buat teks dan konsep desain yang indah untuk undangan digital Anda. Cukup isi detail acara dan biarkan AI yang merangkai kata.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* --- Form Section --- */}
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="event-type">Jenis Acara</Label>
                    <Select value={eventType} onValueChange={(v) => setEventType(v)} disabled={isLoading}>
                        <SelectTrigger id="event-type"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Pernikahan">Pernikahan</SelectItem>
                            <SelectItem value="Ulang Tahun">Ulang Tahun</SelectItem>
                            <SelectItem value="Aqiqah">Aqiqah</SelectItem>
                            <SelectItem value="Syukuran">Syukuran</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="theme">Tema / Gaya Undangan</Label>
                    <Input id="theme" value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="Contoh: Minimalis Elegan" disabled={isLoading} />
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="person-one-name">
                        {eventType === 'Pernikahan' ? 'Nama Mempelai Pria/Wanita' : 'Nama yang Beracara'}
                    </Label>
                    <Input id="person-one-name" value={personOneName} onChange={(e) => setPersonOneName(e.target.value)} placeholder="Contoh: Budi" disabled={isLoading} />
                </div>
                {eventType === 'Pernikahan' && (
                    <div className="space-y-2">
                        <Label htmlFor="person-two-name">Nama Mempelai Pasangan</Label>
                        <Input id="person-two-name" value={personTwoName} onChange={(e) => setPersonTwoName(e.target.value)} placeholder="Contoh: Ani" disabled={isLoading}/>
                    </div>
                )}
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="event-date">Tanggal Acara</Label>
                    <Input id="event-date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} placeholder="Contoh: Sabtu, 28 Desember 2024" disabled={isLoading}/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="event-time">Waktu Acara</Label>
                    <Input id="event-time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} placeholder="Contoh: 10:00 WIB - Selesai" disabled={isLoading}/>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="event-venue">Lokasi & Alamat Acara</Label>
                <Textarea id="event-venue" value={eventVenue} onChange={(e) => setEventVenue(e.target.value)} placeholder="Contoh: Grand Ballroom Hotel Indonesia, Jl. MH Thamrin No. 1, Jakarta" disabled={isLoading} rows={3}/>
            </div>
        </div>
        
        <Button onClick={handleGenerate} disabled={isLoading || !personOneName || !eventDate || !eventVenue} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Buat Konten Undangan
        </Button>

        {/* --- Output Section --- */}
        {output && (
          <div className="space-y-6 pt-6 border-t">
            <h3 className="text-xl font-bold text-center">Hasil Konten Undangan Anda</h3>
            <OutputField label="Judul Undangan" value={output.title} onCopy={() => handleCopy(output.title, 'Judul')} />
            <OutputField label="Ayat / Kutipan Pembuka" value={output.openingVerse} onCopy={() => handleCopy(output.openingVerse, 'Kutipan Pembuka')} />
            <OutputField label="Isi Undangan" value={output.bodyText} onCopy={() => handleCopy(output.bodyText, 'Isi Undangan')} />
            <OutputField label="Detail Acara (Waktu & Tempat)" value={output.eventDetails} onCopy={() => handleCopy(output.eventDetails, 'Detail Acara')} />
            <OutputField label="Teks Penutup" value={output.closingText} onCopy={() => handleCopy(output.closingText, 'Teks Penutup')} />
            <OutputField label="Saran Desain" value={output.designSuggestion} onCopy={() => handleCopy(output.designSuggestion, 'Saran Desain')} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
