
import { Toaster } from 'sonner';
import { Noto_Sans, Playfair_Display } from "next/font/google";
import { cn } from "@/lib/utils";

const playfairDisplayHeading = Playfair_Display({subsets:['latin'],variable:'--font-heading'});

const notoSans = Noto_Sans({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({ children, } : {
  children: React.ReactNode
}) 
{
  return (
    <html lang="en" className={cn("font-sans", notoSans.variable, playfairDisplayHeading.variable)}>
      <body>
        {children}
        <Toaster richColors closeButton />
      </body>
    </html>
  );
}
