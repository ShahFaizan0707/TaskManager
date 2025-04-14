import { Navbar } from "./MainNavbar"
import { Toaster } from "@/components/ui/sonner"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen w-screen">
      <Navbar />
      <div className="flex-1 bg-background bg-custom-light dark:bg-custom-dark">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1600px] py-8 drop-shadow-lg">
          {children}
          <Toaster />
        </div>
      </div>
    </div>
  )
}