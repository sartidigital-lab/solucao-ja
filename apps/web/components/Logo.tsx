import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | number;
}

export default function Logo({ className = '', showText = true, size = 'md' }: LogoProps) {
  // Configurações de tamanho responsivo
  let iconSize = 32;
  let textSizeClass = 'text-lg';
  let gapClass = 'gap-2';

  if (size === 'sm') {
    iconSize = 24;
    textSizeClass = 'text-sm';
    gapClass = 'gap-1.5';
  } else if (size === 'lg') {
    iconSize = 40;
    textSizeClass = 'text-2xl';
    gapClass = 'gap-3';
  } else if (typeof size === 'number') {
    iconSize = size;
    if (size < 28) {
      textSizeClass = 'text-sm';
    } else if (size > 36) {
      textSizeClass = 'text-2xl';
    } else {
      textSizeClass = 'text-lg';
    }
  }

  return (
    <div className={`flex items-center ${gapClass} ${className} select-none`}>
      {/* Ícone do Novo Logotipo */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        style={{ color: 'var(--color-primary, #ea580c)' }}
        aria-hidden="true"
      >
        {/* Linhas de velocidade no lado esquerdo */}
        <path
          d="M 12 18 L 18 18"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Linha do meio com o traço separado à esquerda */}
        <path
          d="M 3 26 L 5 26"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M 9 26 L 18 26"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Linha inferior */}
        <path
          d="M 12 34 L 18 34"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Corpo do Pin de localização (com bico no lado inferior esquerdo) */}
        <path
          d="M 22 48 C 18 42 20 36 20 26 C 20 17.16 27.16 10 36 10 C 44.84 10 52 17.16 52 26 C 52 34.84 44.84 42 36 42 C 30 42 24.5 45.5 22 48 Z"
          stroke="currentColor"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Checkmark interno */}
        <path
          d="M 29 27 L 34 32 L 43 21"
          stroke="currentColor"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Alvo / mini-círculo no canto inferior direito */}
        <circle
          cx="47"
          cy="37"
          r="5.5"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="var(--color-bg, #ffffff)"
        />
        <circle
          cx="47"
          cy="37"
          r="1.5"
          fill="currentColor"
        />
      </svg>

      {/* Texto do Logo */}
      {showText && (
        <span 
          className={`${textSizeClass} font-bold tracking-tight`}
          style={{ color: 'var(--color-ink, #262626)' }}
        >
          Solução <span style={{ color: 'var(--color-primary, #ea580c)', fontWeight: 900 }}>Já</span>
        </span>
      )}
    </div>
  );
}
