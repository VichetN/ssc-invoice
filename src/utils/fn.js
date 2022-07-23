import Cookies from 'js-cookie';

export const closeTab = () => {
    // window.open(window.location, '_self').close()
    delete_cookie('is_logged')
    window.top.close()
};

export const getVAT = (price,vatRate) =>{
    let vat = (price * vatRate) / 100

    return vat
}

export function getCookie(cname) {
    return Cookies.get(cname);
    
  }

export function delete_cookie(name) {
    Cookies.remove(name)
};

export function setCookie(c_name, value, exdays) {
    Cookies.set(c_name, value, { expires: exdays })
}