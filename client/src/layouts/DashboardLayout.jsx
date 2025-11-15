import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar from '../components/common/Sidebar'
import Header from '../components/common/Header'

const DashboardLayout = () => {
  const { user } = useSelector((state) => state.auth)

  return (
    <div className="d-flex flex-column" style={{minHeight: '100vh'}}>
      <Header />
      <div className="d-flex flex-grow-1" style={{marginTop: '70px'}}>
        <Sidebar userRole={user?.role} />
        <main className="flex-grow-1 p-4" style={{backgroundColor: '#f8f9fa', overflow: 'auto'}}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
