import type { ReactNode } from 'react';

type PageContainerProps = {
  children: ReactNode;
  className?: string;
};

export default function PageContainer({ children, className }: PageContainerProps) {
  const containerClassName = ['page-container', className]
    .filter(Boolean)
    .join(' ');

  return <div className={containerClassName}>{children}</div>;
}
