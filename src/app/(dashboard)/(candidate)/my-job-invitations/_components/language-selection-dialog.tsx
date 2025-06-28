'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  availableLanguages,
  getBrowserLanguage,
  type LanguageOption,
} from '@/lib/constants/language-constants';

interface LanguageSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLanguageSelect: (languageCode: string) => void;
  isLoading?: boolean;
}

export default function LanguageSelectionDialog({
  open,
  onOpenChange,
  onLanguageSelect,
  isLoading = false,
}: LanguageSelectionDialogProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => getBrowserLanguage());

  const handleContinue = () => {
    onLanguageSelect(selectedLanguage);
  };

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Interview Language</DialogTitle>
          <DialogDescription>
            Choose your preferred language for the interview session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language-select">Interview Language</Label>
            <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger id="language-select">
                <SelectValue placeholder="Select your preferred language" />
              </SelectTrigger>
              <SelectContent>
                {availableLanguages.map((language: LanguageOption) => (
                  <SelectItem key={language.code} value={language.code}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{language.flag}</span>
                      <span>{language.name}</span>
                      {language.isDefault && (
                        <span className="text-xs text-muted-foreground">(Recommended)</span>
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
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button onClick={handleContinue} disabled={isLoading} className="flex-1">
            {isLoading ? 'Starting Interview...' : 'Start Interview'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
