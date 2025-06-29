'use client';

import { Globe, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { availableLanguages, type LanguageOption } from '@/lib/constants/language-constants';

interface InterviewLanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (languageCode: string) => Promise<void>;
  disabled?: boolean;
}

export default function InterviewLanguageSelector({
  currentLanguage,
  onLanguageChange,
  disabled = false,
}: InterviewLanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);
  const [isUpdating, setIsUpdating] = useState(false);

  const currentLangData = availableLanguages.find((lang) => lang.code === currentLanguage);

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
  };

  const handleSaveLanguage = async () => {
    if (selectedLanguage === currentLanguage) {
      setOpen(false);
      return;
    }

    setIsUpdating(true);
    try {
      await onLanguageChange(selectedLanguage);

      const newLangData = availableLanguages.find((lang) => lang.code === selectedLanguage);
      toast.success(`Interview language changed to ${newLangData?.name || selectedLanguage}`);

      setOpen(false);
    } catch (error) {
      console.error('Error updating language:', error);
      toast.error('Failed to update language preference. Please try again.');
      // Reset to current language on error
      setSelectedLanguage(currentLanguage);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled} className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span className="text-lg">{currentLangData?.flag}</span>
          <span className="hidden sm:inline">{currentLangData?.name}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Interview Language</DialogTitle>
          <DialogDescription>
            Select your preferred language for the interview session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language-select">Interview Language</Label>
            <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger id="language-select">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {availableLanguages.map((language: LanguageOption) => (
                  <SelectItem key={language.code} value={language.code}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{language.flag}</span>
                      <span>{language.name}</span>
                      {language.isDefault && (
                        <span className="text-xs text-muted-foreground">(Default)</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isUpdating}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveLanguage}
            disabled={isUpdating || selectedLanguage === currentLanguage}
            className="flex-1"
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
