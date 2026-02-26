import DictLayout from '@/components/admin/DictLayout'
import AdminLayout from '@/components/admin/AdminLayout'

export default function DictRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminLayout>
      <DictLayout>
        {children}
      </DictLayout>
    </AdminLayout>
  )
}