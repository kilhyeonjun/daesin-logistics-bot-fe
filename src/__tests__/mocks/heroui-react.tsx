import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes } from 'react';

interface HeroButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isDisabled?: boolean;
  isIconOnly?: boolean;
  variant?: string;
  size?: string;
}

export const Button = forwardRef<HTMLButtonElement, HeroButtonProps>(
  ({ isDisabled, isIconOnly, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      disabled={isDisabled}
      data-icon-only={isIconOnly}
      data-variant={variant}
      data-size={size}
      {...props}
    />
  )
);
Button.displayName = 'HeroUIButtonMock';

export function Skeleton(props: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} />;
}
