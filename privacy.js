// Presentation state is independent of account loading, so controls work immediately.
// Signed-in preferences are saved by each page through the authenticated profile API.
export function createAmountVisibility({ root, amounts = [], controls = [], onChange = () => {} }) {
    let hidden = false;
    const values = new Map(amounts.map(element => [element, element.textContent]));
    function render() {
        root.classList.toggle('amounts-private', hidden);
        for (const [element, value] of values) element.textContent = hidden ? '••••' : value;
        for (const control of controls) {
            if (control.type === 'checkbox') control.checked = hidden;
            else {
                control.textContent = hidden ? 'Show amounts' : 'Hide amounts';
                control.setAttribute('aria-pressed', String(hidden));
            }
        }
    }
    function setHidden(value) { hidden = Boolean(value); render(); }
    function setAmount(element, value) { values.set(element, value); render(); }
    for (const control of controls) {
        const event = control.type === 'checkbox' ? 'change' : 'click';
        control.addEventListener(event, () => {
            setHidden(control.type === 'checkbox' ? control.checked : !hidden);
            onChange(hidden);
        });
    }
    render();
    return { setHidden, setAmount, isHidden: () => hidden };
}

// Carry a guest's display choice between pages without saving personal preferences.
export function linkAmountVisibility(hidden, document) {
    for (const link of document.querySelectorAll('a[href]')) {
        const url = new URL(link.href, location.href);
        if (url.origin !== location.origin || !['/', '/index.html', '/setting.html'].includes(url.pathname)) continue;
        url.searchParams.set('hideAmounts', String(hidden));
        link.href = url.href;
    }
}
