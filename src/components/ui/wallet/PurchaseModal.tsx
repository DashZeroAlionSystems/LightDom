/**
 * Purchase Confirmation Modal - Enhanced purchase flow with security features
 */

import React, { useState } from 'react';
import { 
  CheckCircle, 
  X, 
  Shield, 
  Lock, 
  AlertTriangle, 
  CreditCard, 
  Coins,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/utils/validation/cn';

interface PurchaseItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'LDC' | 'USD';
  category: 'space' | 'tools' | 'upgrades' | 'cosmetics';
  image: string;
  discount?: number;
  featured?: boolean;
}

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: PurchaseItem | null;
  userBalance: number;
  onConfirm: (item: PurchaseItem, quantity: number, paymentMethod: string) => Promise<void>;
  isLoading?: boolean;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  onClose,
  item,
  userBalance,
  onConfirm,
  isLoading = false
}) => {
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'lightdom' | 'crypto' | 'fiat'>('lightdom');
  const [showSecurityCode, setShowSecurityCode] = useState(false);
  const [securityCode, setSecurityCode] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showBalance, setShowBalance] = useState(false);

  if (!isOpen || !item) return null;

  const totalPrice = item.price * quantity;
  const hasInsufficientFunds = userBalance < totalPrice;
  const canPurchase = !hasInsufficientFunds && agreedToTerms && securityCode.length >= 4;

  const formatCurrency = (amount: number, currency: string) => {
    const symbols = {
      'LDC': 'LDC',
      'USD': '$',
      'BTC': '₿',
      'ETH': 'Ξ'
    };
    return `${symbols[currency as keyof typeof symbols]}${amount.toFixed(2)}`;
  };

  const handleConfirm = async () => {
    if (!canPurchase) return;
    
    try {
      await onConfirm(item, quantity, paymentMethod);
      // Reset form
      setQuantity(1);
      setSecurityCode('');
      setAgreedToTerms(false);
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setQuantity(1);
      setSecurityCode('');
      setAgreedToTerms(false);
      onClose();
    }
  };

  return (
    <div className="ld-modal ld-animate-fade-in">
      <div className="ld-modal__content ld-animate-scale-in">
        <div className="ld-modal__header">
          <div className="ld-flex ld-flex--center" style={{ gap: 'var(--ld-space-2)' }}>
            <Shield className="h-5 w-5 ld-text-primary" />
            <h3 className="ld-modal__title">Secure Purchase</h3>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="ld-modal__close ld-hover-scale"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="ld-modal__body">
          {/* Item Details */}
          <div className="ld-card ld-card--elevated ld-mb-6">
            <div className="ld-flex ld-flex--center" style={{ gap: 'var(--ld-space-4)' }}>
              <div className="ld-flex ld-flex--center" style={{ 
                width: '4rem', 
                height: '4rem', 
                borderRadius: 'var(--ld-radius-lg)',
                background: 'var(--ld-gradient-primary)',
                fontSize: '2rem'
              }}>
                {item.image}
              </div>
              <div className="ld-flex--grow">
                <h4 className="ld-text-lg ld-font-semibold ld-text-primary ld-mb-1">
                  {item.name}
                </h4>
                <p className="ld-text-sm ld-text-secondary ld-mb-2">
                  {item.description}
                </p>
                <div className="ld-flex ld-flex--center" style={{ gap: 'var(--ld-space-2)' }}>
                  <span className="ld-text-xs ld-text-muted" style={{ 
                    background: 'var(--ld-color-tertiary)',
                    padding: 'var(--ld-space-1) var(--ld-space-2)',
                    borderRadius: 'var(--ld-radius-sm)'
                  }}>
                    {item.category}
                  </span>
                  {item.featured && (
                    <span className="ld-text-xs ld-text-primary ld-font-medium">
                      ⭐ Featured
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quantity Selection */}
          <div className="ld-mb-6">
            <label className="ld-text-sm ld-font-medium ld-text-primary ld-mb-2 ld-block">
              Quantity
            </label>
            <div className="ld-flex ld-flex--center" style={{ gap: 'var(--ld-space-2)' }}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1 || isLoading}
                className="ld-btn ld-btn--ghost ld-btn--sm ld-hover-scale"
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={isLoading}
                className="ld-input ld-text-center"
                style={{ width: '4rem' }}
                min="1"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                disabled={isLoading}
                className="ld-btn ld-btn--ghost ld-btn--sm ld-hover-scale"
              >
                +
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div className="ld-mb-6">
            <label className="ld-text-sm ld-font-medium ld-text-primary ld-mb-3 ld-block">
              Payment Method
            </label>
            <div className="ld-grid ld-grid--cols-3 ld-grid--gap-md">
              <button
                onClick={() => setPaymentMethod('lightdom')}
                disabled={isLoading}
                className={cn(
                  "ld-btn ld-btn--md ld-flex ld-flex--col ld-items--center ld-hover-lift",
                  paymentMethod === 'lightdom' ? 'ld-btn--primary' : 'ld-btn--ghost'
                )}
                style={{ gap: 'var(--ld-space-1)' }}
              >
                <Coins className="h-4 w-4" />
                <span className="ld-text-xs">LightDom</span>
              </button>
              <button
                onClick={() => setPaymentMethod('crypto')}
                disabled={isLoading}
                className={cn(
                  "ld-btn ld-btn--md ld-flex ld-flex--col ld-items--center ld-hover-lift",
                  paymentMethod === 'crypto' ? 'ld-btn--primary' : 'ld-btn--ghost'
                )}
                style={{ gap: 'var(--ld-space-1)' }}
              >
                <CreditCard className="h-4 w-4" />
                <span className="ld-text-xs">Crypto</span>
              </button>
              <button
                onClick={() => setPaymentMethod('fiat')}
                disabled={isLoading}
                className={cn(
                  "ld-btn ld-btn--md ld-flex ld-flex--col ld-items--center ld-hover-lift",
                  paymentMethod === 'fiat' ? 'ld-btn--primary' : 'ld-btn--ghost'
                )}
                style={{ gap: 'var(--ld-space-1)' }}
              >
                <CreditCard className="h-4 w-4" />
                <span className="ld-text-xs">Fiat</span>
              </button>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="ld-card ld-card--elevated ld-mb-6">
            <div className="ld-space-y-3">
              <div className="ld-flex ld-flex--between ld-items--center">
                <span className="ld-text-sm ld-text-secondary">Item Price:</span>
                <span className="ld-text-sm ld-font-medium ld-text-primary">
                  {formatCurrency(item.price, item.currency)}
                </span>
              </div>
              <div className="ld-flex ld-flex--between ld-items--center">
                <span className="ld-text-sm ld-text-secondary">Quantity:</span>
                <span className="ld-text-sm ld-font-medium ld-text-primary">
                  {quantity}x
                </span>
              </div>
              {item.discount && (
                <div className="ld-flex ld-flex--between ld-items--center">
                  <span className="ld-text-sm ld-text-success">Discount ({item.discount}%):</span>
                  <span className="ld-text-sm ld-font-medium ld-text-success">
                    -{formatCurrency((item.price * quantity * item.discount) / 100, item.currency)}
                  </span>
                </div>
              )}
              <div className="ld-border-t ld-border-light ld-pt-3">
                <div className="ld-flex ld-flex--between ld-items--center">
                  <span className="ld-text-md ld-font-semibold ld-text-primary">Total:</span>
                  <span className="ld-text-lg ld-font-bold ld-text-primary">
                    {formatCurrency(totalPrice, item.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Balance Display */}
          <div className="ld-mb-6">
            <div className="ld-flex ld-flex--between ld-items--center ld-mb-2">
              <span className="ld-text-sm ld-font-medium ld-text-primary">Your Balance:</span>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="ld-btn ld-btn--ghost ld-btn--sm ld-hover-scale"
              >
                {showBalance ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </button>
            </div>
            <div className="ld-text-lg ld-font-semibold ld-text-secondary">
              {showBalance ? formatCurrency(userBalance, 'LDC') : '•••••• LDC'}
            </div>
            {hasInsufficientFunds && (
              <div className="ld-flex ld-flex--center ld-mt-2" style={{ gap: 'var(--ld-space-1)' }}>
                <AlertTriangle className="h-4 w-4 ld-text-danger" />
                <span className="ld-text-sm ld-text-danger">
                  Insufficient funds. Need {formatCurrency(totalPrice - userBalance, 'LDC')} more.
                </span>
              </div>
            )}
          </div>

          {/* Security Code */}
          <div className="ld-mb-6">
            <label className="ld-text-sm ld-font-medium ld-text-primary ld-mb-2 ld-block">
              Security Code (4 digits)
            </label>
            <div className="ld-flex ld-flex--center" style={{ gap: 'var(--ld-space-2)' }}>
              <input
                type={showSecurityCode ? 'text' : 'password'}
                value={securityCode}
                onChange={(e) => setSecurityCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                disabled={isLoading}
                className="ld-input ld-text-center"
                style={{ width: '6rem', fontFamily: 'monospace' }}
                placeholder="••••"
                maxLength={4}
              />
              <button
                onClick={() => setShowSecurityCode(!showSecurityCode)}
                disabled={isLoading}
                className="ld-btn ld-btn--ghost ld-btn--sm ld-hover-scale"
              >
                {showSecurityCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="ld-mb-6">
            <label className="ld-flex ld-flex--center" style={{ gap: 'var(--ld-space-2)' }}>
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                disabled={isLoading}
                className="ld-w-4 ld-h-4"
              />
              <span className="ld-text-sm ld-text-secondary">
                I agree to the <a href="/terms" className="ld-text-primary ld-hover-underline">Terms of Service</a> and <a href="/privacy" className="ld-text-primary ld-hover-underline">Privacy Policy</a>
              </span>
            </label>
          </div>
        </div>

        <div className="ld-modal__footer">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="ld-btn ld-btn--ghost ld-hover-lift"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canPurchase || isLoading}
            className={cn(
              "ld-btn ld-hover-glow",
              canPurchase ? "ld-btn--primary" : "ld-btn--secondary"
            )}
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 ld-animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Confirm Purchase
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;
