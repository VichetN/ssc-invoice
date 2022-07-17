import React, { useEffect, useRef, useState } from 'react'
import './Invoice.scss'
import InvoiceLogo from '../../assets/images/invoice-logo.png';
import AbaQrCode from '../../assets/images/aba_qr_code.png';
import CheckBoxImage from '../../assets/images/checked.png';
import UnCheckBoxImage from '../../assets/images/unchecked.png';
import { useRequest } from 'ahooks';
import { getInvoiceByStudent } from '../../services';
import calculateAge from 'calculate-age'
import moment from 'moment';
import { GrMapLocation } from 'react-icons/gr'
import { MdPhoneIphone } from 'react-icons/md';
import { GiBank } from 'react-icons/gi'
import { FaPrint } from 'react-icons/fa'
import { useReactToPrint } from 'react-to-print';
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'

function Invoice() {

    const { studentId, invoiceId } = useParams()

    const [invoiceData, setInvoiceData] = useState(null)
    const [paymentType, setPaymentType] = useState('cash')
    const [rielExchangeRate, setRielExchangeRate] = useState(4000)
    const [discount,setDiscount] = useState(0)
    const [grandTotal,setGrandTotal] = useState(0)
    const [remark,setRemark] = useState(0)
    const [startDate,setStartDate] = useState(null)
    const [dueDate,setDueDate] = useState(null)

    const [isEditMode, setIsEditMode] = useState(false)

    const printRef = useRef();

    const { loading, run } = useRequest(getInvoiceByStudent, {
        onSuccess: (res) => {
            if (res?.status) {
                setInvoiceData(res?.data?.data)
            }
        },
        // pollingInterval: 60000,
        defaultParams: [{ studentId: studentId, invoiceId: invoiceId }]
    });


    useEffect(() => {
        setPaymentType(invoiceData?.pay_type)
        setDiscount(invoiceData?.discount)
        setStartDate(invoiceData?.i_startdate)
        setDueDate(invoiceData?.i_enddate)
        setRemark(invoiceData?.inv_remark)
        setGrandTotal(parseFloat(invoiceData?.price))
        console.log(invoiceData)
    }, [invoiceData])

    const getStudentAge = (date) => {
        const age = invoiceData?.birthdate ? new calculateAge(invoiceData?.birthdate, moment().format('YYYY-MM-DD')).getObject() : null

        return `${age?.years}Y`
    }

    const printInvoice = useReactToPrint({
        content: () => printRef.current,
    });

    const handlePrint = async () => {
        if (isEditMode) {
            toast.warn('Please save before print!')
            return
        };

        printInvoice()
    }

    const handleSave = () => {
        setIsEditMode(false)
    }

    return (
        <>
            <div>
                <div className="button-container">
                    {
                        !isEditMode ? (
                            <button title="Edit" onClick={() => setIsEditMode(true)} className="btn-print" id="edit-btn">Edit</button>
                        ) : (
                            <button title="Save" className="btn-print" onClick={handleSave} id="edit-btn">Save</button>
                        )
                    }
                    <button title="Print" onClick={handlePrint} className="btn-print"><FaPrint fontSize={17} /></button>
                    <a href="deleteInvoice.php?id=1639" className="btn-delete">Delete</a>
                    <button className="btn-cross">Close</button>
                    <input type="hidden" id="studentid" defaultValue={912} />
                </div>
                <div className="invoice-box bg-white" ref={printRef}>
                    {
                        invoiceData?.status === 'paid' && (
                            <div className="box-status-opacity">
                                PAID<br />
                                <span id="paidDate">{moment(invoiceData?.paid_date).format('DD/MMM/YYYY')}</span>
                            </div>
                        )
                    }

                    <table cellPadding={0} cellSpacing={0} style={{ fontSize: '13px' }}>
                        <tbody>
                            <tr className="top">
                                <td colSpan={2} style={{ padding: '0px' }}>
                                    <table>
                                        <tbody><tr>
                                            <td className="title" style={{ paddingBottom: '0px', width: '32%' }}>
                                                <img alt='ssc-invoice-logo' src={InvoiceLogo} className="rounded-circle" style={{ height: '70px', maxHeight: '70px' }} />
                                            </td>
                                            <td style={{ textAlign: 'left', padding: '0px' }}>
                                                <h1 className="header-text" style={{ fontSize: '25px', marginLeft: '0px' }}>សឺវ៉ាយវ៉ល ស្វីម ក្លឹប</h1>
                                                <h2 style={{ marginLeft: '20px' }}>SURVIVAL SWIM CLUB</h2>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={6}>
                                    <hr className="line-head line" style={{ borderTop: '4px solid #000' }} />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table cellPadding={0} cellSpacing={0} style={{ fontSize: '13px' }}>
                        <tbody>
                            <tr className="information">
                                <td colSpan={6} style={{ width: '75%!important' }}>
                                    <span className="info-text-kh"><GrMapLocation /> ភូមិវត្តបូព៌ សង្កាត់សាលាកំរើក ក្រុងសៀមរាប ខេត្តសៀមរាប</span><br />
                                    <span className="info-text">&emsp; Wat Bo Village, Sangkat Sala Kamreuk, Siem Reap Municipality, Siem Reap Province</span><br />
                                    {/* <span className="info-text-kh">ក្រុង/ស្រុក/ខណ្ឌ សៀមរាប ខេត្ត/រាជធានី សៀមរាប ទូរស័ព្ទ៖ ០១២ ៧៩៧ ០៨៥ / ០១៥ ៣៨២ ៨០៣</span><br /> */}
                                    {/* <span className="info-text">Town/District/Khan Siem Reap, Siem Reap Province Tel: 012 797 085 / 015 382 803</span><br /> */}
                                    <span className="info-text"><MdPhoneIphone /> Email: srsurvivalswim@gmail.com / Facebook : Survival Swim Club</span><br /><br />

                                    <span className="info-text"><GiBank /> The Advanced Bank of Asia Limited</span><br />
                                    <span className="info-text">&emsp;&nbsp; Account Name: <b>Survival Swim Club</b></span><br />
                                    <span className="info-text">&emsp;&nbsp; Account Number: <b>004207190</b></span><br />

                                    {/* <span className="info-text"><GiBank /> ABA : Ra Ya &amp; Ek Samedy (000934558) / WING : Ra Ya (01807557)</span><br />
                                    <span className="info-text">ACLEDA : Ra Ya (0100 0035 9809 21)</span><br /> */}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    {/* <img alt='ssc' src={AbaQrCode} className="qr_code" />
                                    <span>ABA Bank</span><br />
                                    <span>Scan here to pay!</span> */}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table cellPadding={0} cellSpacing={0} style={{ fontSize: '13px' }}>
                        <tbody>
                            <tr>
                                <td colSpan={6}>
                                    <hr className="line" style={{ margin: '0px' }} />
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center' }}>
                                    <span className="header-text" style={{ fontSize: '17px' }}>វិក្កយប័ត្រ</span><br />
                                    <span className="info-text" style={{ fontWeight: 'bold', fontSize: '20px' }}>Invoice</span><br />
                                </td>
                            </tr>
                            <tr>
                                <td style={{ width: '60%' }}>
                                    <span className="info-text-kh">អតិថិជន</span> / <span className="info-text">Customer</span><br />
                                    <span><b>{`${invoiceData?.st_prefix !== '' ? invoiceData?.st_prefix + '.' : ''} ${invoiceData?.st_name}`}, {getStudentAge(invoiceData?.birthdate)}</b></span><br />
                                    <span className="info-text-kh">អាស័យដ្ឋាន</span> / <span className="info-text">Address</span> : <span>{invoiceData?.address}</span><br />
                                    <span className="info-text-kh">ទូរស័ព្ទលេខ</span> / <span className="info-text">Tel</span> : <span>092299696</span><br />
                                </td>
                                <td style={{ textAlign: 'left', width: '40%' }}>
                                    <span className="info-text-kh">លេខរៀងវិក្កយប័ត្រ</span> / <span className="info-text">Invoice N<sup style={{ fontSize: '10px' }}>o</sup></span> : <span>0001639</span><br />
                                    <span className="info-text-kh">ម៉ោង</span> / <span className="info-text">Time : {moment(`${invoiceData?.created} ${invoiceData?.time}`).format('hh:mm a')}</span><br />

                                    <span className="info-text-kh">កាលបរិច្ខេទ</span> / <span className="info-text">Start Date</span> :
                                    {
                                        isEditMode ?
                                            <>
                                                <input type="date" id="edit-invoice-date" onChange={(e)=> setStartDate(moment(e.target.value).format('YYYY-MM-DD'))} value={startDate} />
                                            </>
                                            :
                                            <>
                                                <span id="e-invoice-date">{moment(startDate).format('DD-MMM-YYYY')}</span>
                                            </>
                                    }
                                    <br />

                                    <span className="info-text-kh">រហូតដល់</span> / <span className="info-text">Due to</span> :
                                    {
                                        isEditMode ?
                                            <>
                                                <input type="date" id="edit-due-date" onChange={(e)=> setDueDate(moment(e.target.value).format('YYYY-MM-DD'))} value={dueDate} />
                                            </>
                                            :
                                            <>
                                                <span id="e-due-date">{moment(dueDate).format('DD-MMM-YYYY')}</span>
                                            </>
                                    }
                                    <br />




                                    {/* <table>
                                        <tbody>
                                            <tr>
                                                <td style={{ textAlign: 'left', width: '50%' }}>


                                                    <input type="date" className="date-hide" id="edit-invoice-date" defaultValue="2022-07-19" />
                                                    <br />

                                                    <input type="date" className="date-hide" id="edit-due-date" defaultValue="2022-07-29" />
                                                </td>
                                                <td style={{ textAlign: 'left', width: '50%' }}>
                                                    <span>

                                                    </span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table> */}
                                </td>
                            </tr>
                        </tbody></table>
                    <table cellPadding={0} cellSpacing={0} style={{ fontSize: '13px' }}>
                        <tbody>
                            <tr className="heading">
                                <td>
                                    <span className="info-text-kh">បរិយាយមុខទំនិញឬសេវាកម្ម</span> /
                                    <span className="info-text">Description of Goods or Services</span>
                                </td>
                                <td>
                                    <span className="info-text-kh">តម្លៃ</span> /
                                    <span className="info-text">Price</span>
                                </td>
                            </tr>
                            <tr className="item">
                                <td>
                                    <span id="course">{invoiceData?.course}</span>
                                </td>
                                <td>
                                    ${parseFloat(invoiceData?.price).toFixed(2)}/{invoiceData?.per}
                                </td>
                            </tr>
                            <tr className="item">
                                <td>
                                    {moment(startDate).format('DD-MMM-YYYY')} - {moment(dueDate).format('DD-MMM-YYYY')}
                                    <br />
                                </td>
                                <td>
                                </td>
                            </tr>
                            <tr className="item">
                                <td colSpan={2}>
                                    {
                                        isEditMode ?
                                            <>
                                                <input type="text" id="edit-remark-input" onChange={(e)=> setRemark(e.target.value)} value={remark} style={{ width: '100%' }} placeholder="remark.." />
                                            </>
                                            :
                                            <>
                                                <span id="e-remark">{remark}</span>
                                            </>
                                    }
                                    <br />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <span onClick={() => setPaymentType('cash')}>
                                        <img alt='ssc' src={paymentType === 'cash' ? CheckBoxImage : UnCheckBoxImage} className="checkpay" data-id="chb_cash" id="chb_cash_box" />
                                        <label className="form-check-label checkpay" data-id="chb_cash" htmlFor="chb_cash"> Cash</label>
                                    </span>
                                    &nbsp;&nbsp;&nbsp;
                                    <span onClick={() => setPaymentType('aba')}>
                                        <img alt='ssc' src={paymentType === 'aba' ? CheckBoxImage : UnCheckBoxImage} className="checkpay" data-id="chb_aba" id="chb_aba_box" />
                                        <label className="form-check-label checkpay" data-id="chb_aba" htmlFor="chb_aba"> ABA</label>
                                    </span>
                                    &nbsp;&nbsp;&nbsp;
                                    <span onClick={() => setPaymentType('acleda')}>
                                        <img alt='ssc' src={paymentType === 'acleda' ? CheckBoxImage : UnCheckBoxImage} className="checkpay" data-id="chb_acleda" id="chb_acleda_box" />
                                        <label className="form-check-label checkpay" data-id="chb_acleda" htmlFor="chb_acleda"> ACLEDA</label>
                                    </span>
                                </td>
                                <td style={{ width: '145px' }}>
                                    <span id="discountBox" className="print-hidden blue-text">
                                        Discount
                                        {
                                            isEditMode ?
                                                <>
                                                    <input type="number" id="discount-input" onChange={(e)=> setDiscount(parseFloat(e.target.value))} value={discount} style={{ width: '40%' }} placeholder="% Dis" />
                                                </>
                                                :
                                                <>
                                                    <span id="discount-show"> {discount}</span>
                                                </>
                                        }

                                    </span>
                                    <br />
                                </td>
                            </tr>

                        </tbody>
                    </table>

                    <table cellPadding={0} cellSpacing={0} style={{ fontSize: '13px' }}>
                        <tbody>
                            <tr className="total" >
                                <td>
                                </td>
                                <td style={{ width: '50%' }}>
                                    <span className="info-text-kh">សរុប</span> / <span>Grand Total (USD) : <span className="totalPrice">${parseFloat(grandTotal - discount).toFixed(2)}</span></span>
                                    <br />
                                </td>
                            </tr>
                            <tr className="total" >
                                <td>
                                </td>
                                <td style={{ width: '50%' }}>
                                    <span className="info-text-kh">អត្រាប្តូរប្រាក់</span> / <span>Exchange Rate 1USD : <span className="totalPrice info-text-kh">4000&#6107;</span></span>
                                    <br />
                                </td>
                            </tr>
                            <tr className="total" >
                                <td>
                                </td>
                                <td style={{ width: '50%' }}>
                                    <span className="info-text-kh">សរុប</span> / <span>Grand Total <span className='info-text-kh'>(&#6107;)</span> : <span className="totalPrice info-text-kh">{(parseFloat(grandTotal) - discount) * rielExchangeRate}&#6107;</span></span>
                                    <br />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <br />
                    <table className="sign" style={{ fontSize: 13 }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '50%', padding: '0px' }}>
                                </td>
                                <td style={{ width: '50%', padding: '0px' }}>
                                    <span>ITADMIN</span>
                                </td>
                            </tr>
                            <tr>
                                <td style={{ width: '50%', padding: '0px' }}>
                                    <div className="line-sign" />
                                    <p>
                                        <span className="info-text-kh">ហត្ថាលេខា និងឈ្មោះអតិថិជន</span><br />
                                        <span className="info-text">Customer's signature &amp; name</span>
                                    </p>
                                </td>
                                <td style={{ width: '50%', padding: '0px' }}>
                                    <div className="line-sign" />
                                    <p>
                                        <span className="info-text-kh">ហត្ថាលេខា និងឈ្មោះអ្នកលក់</span><br />
                                        <span className="info-text">Seller's signature &amp; name</span>
                                    </p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table style={{ fontSize: '10px' }}>
                        <tbody>
                            <tr className="note">
                                <td colSpan={2} style={{ width: '50%' }}>
                                    <span className="header-text">សម្គាល់ ៖</span>
                                    <span className="info-text-kh"> ច្បាប់ដើមសម្រាប់អ្នកទិញ ច្បាប់ចម្លងសម្រាប់អ្នកលក់ / រាល់ការទូទាត់ហើយ មិនអាចដកប្រាក់វិញបានទេ</span>
                                    <br />
                                    <span className="info-text">Note : Orginal invoice for customer, copied invoice for seller / All payment are non-refundable.</span>  <br />

                                </td>
                                {/* <td style={{ width: '50%' }}>
                                    <span className="info-text-kh">តំលៃខាងលើមិនរាប់ញ្ចូលតំលៃអាងទឹក</span>
                                    <br />
                                    <span className="info-text"><b>The price above doesn’t including pool entrance fee.</b></span>  <br />
                                    <span className="info-text-kh">ថ្នាក់ហែលទឹកយើងខ្ញុំសូមរក្សាសិទ្ធិកាត់ថ្លៃបង្រៀនហែលទឹក ចាប់ពីថ្ងៃចេញវិក័យបត្រ បើទោះបីជាអតិថិជនមិនមកទទួលសេវាកម្ម</span>
                                    <br />
                                    <span className="info-text"><b>Survival Swim Club reserves the right to charge swimming class from issued date, although customer doesn’t pick up the service.</b></span>
                                </td> */}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}

export default Invoice