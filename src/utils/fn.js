export const closeTab = () => {
    // window.open(window.location, '_self').close()
    window.top.close()
};

export const getVAT = (price,vatRate) =>{
    let vat = (price * vatRate) / 100

    return vat
}