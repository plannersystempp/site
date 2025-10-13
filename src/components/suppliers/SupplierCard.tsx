import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, Edit, Star, Package, MapPin, Building2 } from 'lucide-react';
import { useEnhancedData, type Supplier } from '@/contexts/EnhancedDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { SupplierItemsManager } from './SupplierItemsManager';
import { formatCNPJ, formatPhoneBrazil } from '@/utils/supplierUtils';

interface SupplierCardProps {
  supplier: Supplier;
  onEdit: (supplier: Supplier) => void;
}

export const SupplierCard: React.FC<SupplierCardProps> = ({ supplier, onEdit }) => {
  const { supplierItems } = useEnhancedData();
  const { user } = useAuth();
  const [showItems, setShowItems] = useState(false);

  const isAdmin = user?.role === 'admin';
  const items = supplierItems.filter(item => item.supplier_id === supplier.id);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground'
            }`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">
          ({supplier.total_ratings})
        </span>
      </div>
    );
  };

  const getAddress = () => {
    const parts = [];
    if (supplier.address_city) parts.push(supplier.address_city);
    if (supplier.address_state) parts.push(supplier.address_state);
    return parts.join(' - ');
  };

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base line-clamp-1">{supplier.name}</CardTitle>
              {supplier.legal_name && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {supplier.legal_name}
                </p>
              )}
            </div>
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(supplier)}
                className="h-8 w-8 p-0 flex-shrink-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
          {renderStars(supplier.average_rating)}
        </CardHeader>

        <CardContent className="flex-1 space-y-3 text-sm">
          {/* CNPJ Badge */}
          {supplier.cnpj && (
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="font-mono text-xs">
                <Building2 className="h-3 w-3 mr-1" />
                {formatCNPJ(supplier.cnpj)}
              </Badge>
            </div>
          )}

          {/* Endereço */}
          {getAddress() && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{getAddress()}</span>
            </div>
          )}

          {/* Pessoa de Contato */}
          {supplier.contact_person && (
            <div className="text-muted-foreground">
              <span className="font-medium text-xs">Contato:</span>{' '}
              <span className="truncate text-xs">{supplier.contact_person}</span>
            </div>
          )}

          {/* Telefones */}
          <div className="space-y-1">
            {supplier.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3 w-3 flex-shrink-0" />
                <span className="truncate text-xs">{formatPhoneBrazil(supplier.phone)}</span>
              </div>
            )}
            {supplier.phone_secondary && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3 w-3 flex-shrink-0" />
                <span className="truncate text-xs">{formatPhoneBrazil(supplier.phone_secondary)}</span>
              </div>
            )}
          </div>

          {/* Email */}
          {supplier.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-3 w-3 flex-shrink-0" />
              <span className="truncate text-xs">{supplier.email}</span>
            </div>
          )}

          {/* Ver Itens */}
          <div className="pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowItems(true)}
              className="w-full"
            >
              <Package className="h-3 w-3 mr-2" />
              Ver Itens ({items.length})
            </Button>
          </div>

          {/* Observações */}
          {supplier.notes && (
            <div className="text-xs text-muted-foreground pt-2 border-t">
              <p className="line-clamp-2">{supplier.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {showItems && (
        <SupplierItemsManager
          supplier={supplier}
          onClose={() => setShowItems(false)}
        />
      )}
    </>
  );
};
