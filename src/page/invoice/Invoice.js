import React, { useEffect, useRef, useState } from 'react'
import './Invoice.scss'
import InvoiceLogo from '../../assets/images/invoice-logo.png';
// import AbaQrCode from '../../assets/images/aba_qr_code.png';
import CheckBoxImage from '../../assets/images/checked.png';
import UnCheckBoxImage from '../../assets/images/unchecked.png';
import { useRequest } from 'ahooks';
import { deleteInvoice, getInvoiceByStudent, saveInvoice, setInvoiceToPaid } from '../../services';
import calculateAge from 'calculate-age'
import moment from 'moment';
import { GrMapLocation } from 'react-icons/gr'
import { MdPhoneIphone } from 'react-icons/md';
import { GiBank } from 'react-icons/gi'
import { FaPrint } from 'react-icons/fa'
import { useReactToPrint } from 'react-to-print';
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { PuffLoader, MoonLoader } from 'react-spinners';
import { closeTab, getCookie } from '../../utils/fn';
import Switch from "react-switch";

function Invoice() {

    const { studentId, invoiceId, courseId } = useParams()

    const [invoiceData, setInvoiceData] = useState(null)
    const [courseData, setCourseData] = useState(null)
    const [paymentType, setPaymentType] = useState('cash')
    const [rielExchangeRate, setRielExchangeRate] = useState(0)
    const [discount, setDiscount] = useState(0)
    const [grandTotal, setGrandTotal] = useState(0)
    const [remark, setRemark] = useState(0)
    const [invoiceDate, setInvoiceDate] = useState(null)
    const [dueDate, setDueDate] = useState(null)
    const [invoiceTime, setInvoiceTime] = useState(null)

    const [startDate, setStartDate] = useState(null)
    const [endDate, setEndDate] = useState(null)

    const [coursePer, setCoursePer] = useState(null)
    const [invoiceCourse, setInvoiceCourse] = useState(null)

    const [isEditMode, setIsEditMode] = useState(false)
    const [vatRate, setVatRate] = useState(0)

    const printRef = useRef();

    const { loading, run: fetchData } = useRequest(getInvoiceByStudent, {
        onSuccess: (res) => {
            if (res?.status) {
                setInvoiceData(res?.data?.data)
                setCourseData(res?.data?.course)
            }
        },
        onError:(err)=>{
            console.log(err.message)
        },
        defaultParams: [{ studentId: studentId, invoiceId: invoiceId, courseId: courseId }]
    });

    const fetchInvoice = () => {
        fetchData({ studentId: studentId, invoiceId: invoiceId, courseId: courseId ? courseId : '' })
    }

    const { loading: loadingSave, run: runSave } = useRequest(saveInvoice, {
        manual: true,
        onSuccess: (res) => {
            if (res?.status) {
                fetchInvoice()
                toast.success(res?.data?.message)
                setIsEditMode(false)
            }
        }
    });

    const { loading: loadingPay, run: runPayment } = useRequest(setInvoiceToPaid, {
        manual: true,
        onSuccess: (res) => {
            if (res?.status) {
                fetchInvoice()
                toast.success(res?.data?.message)
                setIsEditMode(false)
            }
        },
    });

    const { loading: loadingDelete, run: runDelete } = useRequest(deleteInvoice, {
        manual: true,
        onSuccess: (res) => {
            if (res?.status) {
                closeTab()
            }
        },
    });

    useEffect(() => {

        setPaymentType(invoiceData?.pay_type)
        setDiscount(invoiceData?.discount)
        setRemark(invoiceData?.inv_remark)
        
        setRielExchangeRate(parseInt(invoiceData?.rielRate) > 0 ? parseInt(invoiceData?.rielRate) : 4000)
        setVatRate(parseInt(invoiceData?.vatRate) > 0 ? parseInt(invoiceData?.vatRate) / 100 : 0)

        setStartDate(moment().format('YYYY-MM-DD'))
        setEndDate(moment().add(1, 'months').format('YYYY-MM-DD'))

        setInvoiceDate(moment().format('YYYY-MM-DD'))
        setDueDate(moment().add(1, 'months').format('YYYY-MM-DD'))

        if (invoiceData?.end_date !== '0000-00-00' && invoiceData?.start_date !== '0000-00-00') {
            setStartDate(invoiceData?.start_date)
            setEndDate(invoiceData?.end_date)

            setInvoiceDate(invoiceData?.start_date)
            setDueDate(invoiceData?.end_date)
        }

        if (invoiceData?.created !== '0000-00-00' && invoiceData?.due !== '0000-00-00') {
            setInvoiceDate(invoiceData?.created)
            setDueDate(invoiceData?.due)
        }

        setInvoiceTime(moment().format('YYYY-MM-DD HH:mm:ss'))
        if (invoiceData?.time !== '00:00:00') {
            setInvoiceTime(`${invoiceData?.created} ${invoiceData?.time}`)
        }

        console.log(invoiceData)
        console.log(courseData)

        setCoursePer(invoiceData?.per)
        setInvoiceCourse(invoiceData?.course)
        setGrandTotal(parseFloat(invoiceData?.price))
        if (invoiceData?.status !== 'paid') {
            setCoursePer(courseData?.per)
            setInvoiceCourse(`${courseData?.type} (${courseData?.day}) ${courseData?.duration}`)
            setRemark(invoiceData?.remark)

            setGrandTotal(parseFloat(courseData?.price))

            return
        }

        setStartDate(invoiceData?.i_startdate)
        setEndDate(invoiceData?.i_enddate)
        if (invoiceData?.paid_date === '') {
            setStartDate(invoiceData?.created)
            setEndDate(invoiceData?.due)
        }

    }, [invoiceData, courseData])

    const getStudentAge = (date) => {
        const age = invoiceData?.birthdate ? new calculateAge(invoiceData?.birthdate, moment().format('YYYY-MM-DD')).getObject() : null

        return `${age?.years}Y`
    }

    const printInvoice = useReactToPrint({
        content: () => printRef.current,
        fonts:[
            {
                family:'khmer-os-sr',
                source:'../../assets/fonts/KHMEROSSIEMREAP.TTF',
            },
            {
                family:'khmer-os-mo',
                source:'../../assets/fonts/KHMEROSMUOLLIGHT.TTF'
            }
        ]
    });

    const handlePrint = async () => {
        if (isEditMode) {
            toast.warn('Please save before print!')
            return
        };

        printInvoice()
    }

    const handleSave = () => {
        runSave({
            studentId,
            invoiceId,
            created: invoiceDate,
            due: dueDate,
            payType: paymentType,
            time: moment(invoiceTime).format('HH:mm:ss'),
            discount: discount,
            remark: remark,

            status: invoiceData?.status,
            startDate: startDate,
            endDate: dueDate,
            per: coursePer,
            rielRate: rielExchangeRate,
            vatRate: vatRate * 100
        })
    }

    const handlePaid = (payment) => {
        runPayment({
            studentId,
            invoiceId,
            created: invoiceDate,
            due: dueDate,
            payType: paymentType,
            time: moment(invoiceTime).format('HH:mm:ss'),
            discount: discount,
            remark: remark,
            course: invoiceCourse,
            status: invoiceData?.status,
            startDate: startDate,
            endDate: dueDate,
            per: coursePer,
            payment: payment,
            rielRate: rielExchangeRate,
            vatRate: vatRate * 100
        })
    }

    const handleDelete = () => {
        runDelete({ invoiceId: invoiceId })
    }

    const handleVAT = (vatRate) => {
        if (!isEditMode) {
            toast.warn('Please click edit to change!')
            return
        };
        setVatRate(parseFloat(vatRate / 100))
    }

    const getGrandTotal = (total) => {
        let vat = total * vatRate
        let grandTotal = total + vat

        return parseFloat(grandTotal)
    }

    if (loading) return <div className='loading-container'><PuffLoader color='#FFFFFF' /></div>

    if (!invoiceData) return <div className='loading-container' style={{ color: '#FFFFFF' }}><div style={{ textAlign: 'center' }}><h3>Something wrong!</h3>Please make sure you click from invoice.</div></div>
    
    if (!courseData && invoiceData?.status!=='paid') return <div className='loading-container' style={{ color: '#FFFFFF' }}><div style={{ textAlign: 'center' }}><h3>Something wrong!</h3>Please make sure student have course.</div></div>

    return (
        <>
            <div>
                <div className="button-container">

                    {
                        !isEditMode ? (
                            <button title="Edit" onClick={() => setIsEditMode(true)} className="btn-print" >Edit</button>
                        ) : (
                            <button title="Save" className="btn-print" disabled={loadingSave} onClick={handleSave} >{loadingSave ? <MoonLoader color='#FFFFFF' size={15} /> : 'Save'}</button>
                        )
                    }

                    {
                        courseId ? (
                            invoiceData?.status === 'pending' ?
                                <>
                                    <button title="Paid" disabled={loadingPay} onClick={() => handlePaid('paid')} className="btn-print" >{loadingPay ? <MoonLoader color='#FFFFFF' size={15} /> : 'Paid'}</button>
                                </>
                                :
                                <>
                                    <button title="Unpay" disabled={loadingPay} onClick={() => handlePaid('pending')} className="btn-print">{loadingPay ? <MoonLoader color='#FFFFFF' size={15} /> : 'Unpay'}</button>
                                </>
                        ) : null

                    }

                    <button title="Print" onClick={handlePrint} className="btn-print"><FaPrint fontSize={17} /></button>
                    <button onClick={handleDelete} disabled={loadingDelete} className="btn-delete">{loadingDelete ? <MoonLoader color='#FFFFFF' size={15} /> : 'Delete'}</button>
                    <button className="btn-cross" onClick={closeTab}>Close</button>

                    <button onClick={() => vatRate > 0 ? handleVAT(0) : handleVAT(10)} className="btn-print" style={{ width: 150 }}>
                        <Switch
                            onChange={() => console.log('Click on switch')}
                            checked={vatRate > 0}
                            value={vatRate > 0}
                            className="react-switch"
                            id="disabled-switch"
                            height={15}
                            width={40}
                        />&emsp;
                        <span>VAT\TIN</span>
                    </button>

                </div>

                <div className="invoice-box bg-white " ref={printRef}>
                    <div className='invoice-content-block'>

                        {
                            invoiceData?.status === 'paid' && (
                                <div className="box-status-opacity" style={{ top: vatRate > 0 ? 575 : 551 }}>
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
                                                    <h1 className="header-text" style={{ fontSize: '25px', marginLeft: '0px' }}>??????????????????????????? ??????????????? ???????????????</h1>
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

                                        {vatRate > 0 ? <><span className="info-text-kh"><GiBank /> ??????????????????????????????????????????????????????????????????????????????(TIN) ??? E116-2200002319</span><br /></> : null}

                                        <span className="info-text-kh"><GrMapLocation /> ???????????????????????????????????? ???????????????????????????????????????????????? ????????????????????????????????? ?????????????????????????????????</span><br />
                                        <span className="info-text">&emsp; Wat Bo Village, Sangkat Sala Kamreuk, Siem Reap Municipality, Siem Reap Province</span><br />
                                        {/* <span className="info-text-kh">???????????????/???????????????/???????????? ?????????????????? ???????????????/????????????????????? ?????????????????? ??????????????????????????? ????????? ????????? ????????? / ????????? ????????? ?????????</span><br /> */}
                                        {/* <span className="info-text">Town/District/Khan Siem Reap, Siem Reap Province Tel: 012 797 085 / 015 382 803</span><br /> */}
                                        <span className="info-text"><MdPhoneIphone /> +855(0)89 868 766 / srsurvivalswim@gmail.com / FB: Survival Swim Club</span><br /><br />

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
                                        <span className="header-text" style={{ fontSize: '17px' }}>?????????????????????????????????</span><br />
                                        <span className="info-text" style={{ fontWeight: 'bold', fontSize: '20px' }}>Invoice</span><br />
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ width: '60%' }}>
                                        <span className="info-text-kh">?????????????????????</span> / <span className="info-text">Customer</span><br />
                                        <span><b>{`${invoiceData?.st_prefix !== '' ? invoiceData?.st_prefix + '.' : ''} ${invoiceData?.st_name}`}, {getStudentAge(invoiceData?.birthdate)}</b></span><br />
                                        <span className="info-text-kh">??????????????????????????????</span> / <span className="info-text">Address</span> : <span>{invoiceData?.address}</span><br />
                                        <span className="info-text-kh">?????????????????????????????????</span> / <span className="info-text">Tel</span> : <span>{invoiceData?.contactnumber}</span><br />
                                    </td>
                                    <td style={{ textAlign: 'left', width: '40%' }}>
                                        <span className="info-text-kh">???????????????????????????????????????????????????</span> / <span className="info-text">Invoice N<sup style={{ fontSize: '10px' }}>o</sup></span> : {invoiceData?.in_id?.toString().padStart(7, '0')}<br />
                                        <span className="info-text-kh">????????????</span> / <span className="info-text">Time : {moment(`${invoiceTime}`).format('hh:mm a')}</span><br />

                                        <span className="info-text-kh">?????????????????????????????????</span> / <span className="info-text">Start Date</span> :
                                        {
                                            isEditMode ?
                                                <>
                                                    <input type="date" id="edit-invoice-date" onChange={(e) => setInvoiceDate(moment(e.target.value).format('YYYY-MM-DD'))} value={invoiceDate} />
                                                </>
                                                :
                                                <>
                                                    <span id="e-invoice-date">{moment(invoiceDate).format('DD-MMM-YYYY')}</span>
                                                </>
                                        }
                                        <br />

                                        <span className="info-text-kh">?????????????????????</span> / <span className="info-text">Due to</span> :
                                        {
                                            isEditMode ?
                                                <>
                                                    <input type="date" id="edit-due-date" onChange={(e) => setDueDate(moment(e.target.value).format('YYYY-MM-DD'))} value={dueDate} />
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
                                        <span className="info-text-kh">?????????????????????????????????????????????????????????????????????</span> /
                                        <span className="info-text">Description of Goods or Services</span>
                                    </td>
                                    <td>
                                        <span className="info-text-kh">???????????????</span> /
                                        <span className="info-text">Price</span>
                                    </td>
                                </tr>
                                <tr className="item">
                                    <td>
                                        <span id="course">{invoiceCourse}</span>
                                    </td>
                                    <td>
                                        ${parseFloat(grandTotal).toFixed(2)}/{coursePer}
                                    </td>
                                </tr>
                                <tr className="item">
                                    <td>
                                        {moment(startDate).format('DD-MMM-YYYY')} - {moment(endDate).format('DD-MMM-YYYY')}
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
                                                    <input type="text" id="edit-remark-input" onChange={(e) => setRemark(e.target.value)} value={remark} style={{ width: '100%' }} placeholder="remark.." />
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
                                                        <input type="number" onWheel={(e) => e.target.blur()} min={0} onChange={(e) => setDiscount(parseFloat(e.target.value !== '' ? e.target.value : 0))} value={discount} style={{ width: '40%' }} placeholder="% Dis" />
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
                                {
                                    vatRate > 0 ?
                                        <>
                                            <tr className="total" >
                                                <td>
                                                </td>
                                                <td style={{ width: '50%' }}>
                                                    <span className="info-text-kh">???????????????????????????????????????????????????</span> / <span>VAT ({vatRate * 100}%)</span>
                                                    <br />
                                                </td>
                                            </tr>
                                        </> : null
                                }


                                <tr className="total" >
                                    <td>
                                    </td>
                                    <td style={{ width: '50%' }}>
                                        <span className="info-text-kh">?????????????????????</span> / <span>Grand Total (USD) : <span className="totalPrice">${parseFloat(getGrandTotal(grandTotal) - discount).toFixed(2)}</span></span>
                                        <br />
                                    </td>
                                </tr>
                                <tr className="total" >
                                    <td>
                                    </td>
                                    <td style={{ width: '50%' }}>
                                        <span className="info-text-kh">????????????????????????????????????????????????</span> / <span>Exchange Rate 1USD :
                                            {
                                                isEditMode ?
                                                    <>
                                                        <input type="number" onWheel={(e) => e.target.blur()} min={0} onChange={(e) => setRielExchangeRate(parseInt(e.target.value !== '' ? e.target.value : 0))} value={rielExchangeRate} style={{ width: '16%' }} placeholder="xxxxxx" />
                                                    </>
                                                    :
                                                    <>
                                                        <span className="totalPrice info-text-kh">{rielExchangeRate}&#6107;</span>
                                                    </>
                                            }

                                        </span>
                                        <br />
                                    </td>
                                </tr>
                                <tr className="total" >
                                    <td>
                                    </td>
                                    <td style={{ width: '50%' }}>
                                        <span className="info-text-kh">????????????</span> / <span>Grand Total <span className='info-text-kh'>(&#6107;)</span> : <span className="totalPrice info-text-kh">{(parseFloat(grandTotal) - discount) * rielExchangeRate}&#6107;</span></span>
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
                                        <span>{getCookie("is_logged")?.toUpperCase()}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ width: '50%', padding: '0px' }}>
                                        <div className="line-sign" />
                                        <p>
                                            <span className="info-text-kh">??????????????????????????? ?????????????????????????????????????????????</span><br />
                                            <span className="info-text">Customer's signature &amp; name</span>
                                        </p>
                                    </td>
                                    <td style={{ width: '50%', padding: '0px' }}>
                                        <div className="line-sign" />
                                        <p>
                                            <span className="info-text-kh">??????????????????????????? ?????????????????????????????????????????????</span><br />
                                            <span className="info-text">Seller's signature &amp; name</span>
                                        </p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                    </div>

                    <div className='invoice-footer'>
                        <table style={{ fontSize: '10px' }}>
                            <tbody>
                                <tr className="note">
                                    <td colSpan={2} style={{ width: '50%' }}>
                                        <span className="header-text">????????????????????? ???</span>
                                        <span className="info-text-kh"> ????????????????????????????????????????????????????????????????????? ??????????????????????????????????????????????????????????????????????????? / ???????????????????????????????????????????????? ??????????????????????????????????????????????????????????????????</span>
                                        <br />
                                        <span className="info-text">Note : Orginal invoice for customer, copied invoice for seller / All payment are non-refundable.</span>  <br />

                                    </td>

                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </>
    )
}

export default Invoice