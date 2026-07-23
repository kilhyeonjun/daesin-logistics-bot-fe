'use client';

import { ReactNode, useCallback } from 'react';
import { ChevronLeft, Menu } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
  leftAction?: 'back' | 'menu' | ReactNode;
  rightAction?: ReactNode;
  className?: string;
  transparent?: boolean;
}

export function Header({
   title = '대신물류',
   leftAction,
   rightAction,
   className,
   transparent = false,
 }: HeaderProps) {
   const router = useRouter();

   const handleBack = useCallback(() => {
     router.back();
   }, [router]);

   const renderLeftAction = () => {
     if (!leftAction) return <div className="w-10" />;

     if (leftAction === 'back') {
       return (
         <button
           type="button"
           onClick={handleBack}
           className="flex h-11 w-11 items-center justify-center rounded-full touch-feedback hover:bg-secondary"
           aria-label="뒤로가기"
         >
           <ChevronLeft className="h-6 w-6" />
         </button>
       );
     }

    if (leftAction === 'menu') {
      return (
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full touch-feedback hover:bg-secondary"
          aria-label="메뉴"
        >
          <Menu className="h-5 w-5" />
        </button>
      );
    }

    return leftAction;
  };

  return (
    <header
      className={cn(
        'mobile-topbar',
        transparent && 'bg-transparent',
        className
      )}
    >
      {renderLeftAction()}

      <h1 className="truncate text-base font-bold text-foreground">
        {title}
      </h1>

      {rightAction ? (
        <div className="flex items-center">{rightAction}</div>
      ) : (
        <Link href="/" className="mobile-brand" aria-label="대신물류 홈">
          대신
        </Link>
      )}
    </header>
  );
}
