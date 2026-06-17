import { redirect } from 'next/navigation';

// Trang /portal → redirect sang /portal/broadcast (trang chính của nhân viên)
export default function PortalHomePage() {
  redirect('/portal/broadcast');
}
