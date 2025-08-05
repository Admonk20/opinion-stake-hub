import { MobileNavbar } from "./MobileNavbar";

interface NavbarProps {
  user: any;
}

export const Navbar = ({ user }: NavbarProps) => {
  return <MobileNavbar user={user} />;
};