
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { formatWhatsAppNumber } from '@/utils/formatters';

interface WhatsAppButtonProps {
  phone?: string;
  name: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phone,
  name,
  size = 'sm',
  variant = 'ghost'
}) => {
  const formattedNumber = formatWhatsAppNumber(phone || '');
  
  if (!formattedNumber) {
    return null;
  }

  const whatsappUrl = `https://wa.me/${formattedNumber}`;

  return (
    <Button
      size={size}
      variant={variant}
      asChild
      className="text-green-600 hover:text-green-700 hover:bg-green-50"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        title={`Conversar com ${name} no WhatsApp`}
      >
        <MessageCircle className="h-4 w-4" />
      </a>
    </Button>
  );
};
