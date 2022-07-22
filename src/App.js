import './App.scss';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Invoice from './page/invoice/Invoice';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          {/* <Route path="/studentId=:studentId&invoiceId=:invoiceId">
            <Route index={true} element={<Invoice />} />
          </Route> */}
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
