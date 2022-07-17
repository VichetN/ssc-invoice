import axios from "axios";
import { toast } from "react-toastify";

export const getInvoiceByStudent = async (value) => {

    try{
        const params = new URLSearchParams();
        params.append('db_user', process.env.React_App_DB_USER);
        params.append('db_password', process.env.React_App_DB_PASSWORD);
        params.append('db', process.env.React_App_DB);
        
        params.append('data', JSON.stringify({...value}));

        const res = await axios.post(`${process.env.React_App_URL}/get/getInvoiceByStudent.php`, params);
        
        if(res?.data?.error){
            toast.error(res?.data?.error)
            return {
                status:false,
                data:null
            }
        }

        return {
            status:true,
            data:res?.data
        }

    }catch(error){
        toast.error(error?.message)
        return {
            status:false,
            data:null
        }
    }
    
}