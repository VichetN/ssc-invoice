import './App.scss';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Invoice from './page/invoice/Invoice';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect, useState } from 'react';
import { getCookie } from './utils/fn';

function App() {

  const [isLogin,setIsLogin] = useState(false)

  useEffect(() => {
    
    if (getCookie("is_logged")) {
      setIsLogin(true)
    } else {
      window.location.replace('../logout.php')
      setIsLogin(false)
    }

  },[])

  if(isLogin) return null

  return (
    <div className="App">
      <Router>
        <Routes>
          {/* <Route path="/studentId=:studentId&invoiceId=:invoiceId">
            <Route index={true} element={<Invoice />} />
          </Route> */}
          <Route path="/studentId=:studentId&invoiceId=:invoiceId&courseId=:courseId&price=:price">
            <Route index={true} element={<Invoice />} />
          </Route>
          <Route path="/studentId=:studentId&invoiceId=:invoiceId&courseId=:courseId">
            <Route index={true} element={<Invoice />} />
          </Route>
          <Route path="/studentId=:studentId&invoiceId=:invoiceId">
            <Route index={true} element={<Invoice />} />
          </Route>
        </Routes>
      </Router>

      <ToastContainer />
    </div>
  );
}

export default App;
