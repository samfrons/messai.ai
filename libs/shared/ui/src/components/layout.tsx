import { type ReactNode } from 'react';
import { cn } from '../utils';

interface LayoutProps {
  children: ReactNode;
  /**
   * Optional navigation items
   */
  navigation?: Array<{
    label: string;
    href: string;
    active?: boolean;
  }>;
  /**
   * Optional user menu
   */
  userMenu?: ReactNode;
  /**
   * Whether to show the sidebar
   */
  showSidebar?: boolean;
  /**
   * Sidebar content
   */
  sidebar?: ReactNode;
}

export default function Layout({
  children,
  navigation = [],
  userMenu,
  showSidebar = false,
  sidebar,
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {/* MESSAI Logo Icon */}
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900">
                  MESSAI<span className="text-primary-600">.AI</span>
                </h1>
              </div>

              {/* Primary Navigation */}
              {navigation.length > 0 && (
                <nav className="hidden md:flex space-x-8 ml-8">
                  {navigation.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'text-sm font-medium transition-colors duration-200',
                        item.active
                          ? 'text-primary-600 border-b-2 border-primary-600'
                          : 'text-gray-600 hover:text-gray-900'
                      )}
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center">
              {userMenu || (
                <div className="text-sm text-gray-500">Scientific Research Platform</div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {showSidebar && (
          <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)]">
            <div className="p-4">{sidebar}</div>
          </aside>
        )}

        {/* Main Content */}
        <main
          className={cn(
            'flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',
            showSidebar && 'max-w-none'
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
