import { Button } from "@/src/components/ui/button";
import { ClipboardList, Home, Library, Milestone, Shield } from "lucide-react";
import Link from "next/link";

export default function SideMenu() {
  return (
    <div className="flex flex-col border-r p-4">
      <nav className="flex flex-col gap-1">
        <Button asChild variant="ghost" className="w-full justify-start">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Home
          </Link>
        </Button>
        <Button asChild variant="ghost" className="w-full justify-start">
          <Link href="/specification-setup">
            <ClipboardList className="mr-2 h-4 w-4" />
            Specification Setup
          </Link>
        </Button>
        <Button asChild variant="ghost" className="w-full justify-start">
          <Link href="/specification-centralize">
            <Library className="mr-2 h-4 w-4" />
            Specification Centralize
          </Link>
        </Button>
        <Button asChild variant="ghost" className="w-full justify-start">
          <Link href="/specification-milestones">
            <Milestone className="mr-2 h-4 w-4" />
            Specification Milestones
          </Link>
        </Button>
        <Button asChild variant="ghost" className="w-full justify-start">
          <Link href="/administrator">
            <Shield className="mr-2 h-4 w-4" />
            Administrator
          </Link>
        </Button>
      </nav>
    </div>
  );
}
