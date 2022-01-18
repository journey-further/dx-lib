export declare const preventScroll: () => void;
export declare const enableScroll: () => void;
export const insertStyle = (style: string, ticket: string): void => {
    if (!!!document.querySelector('#' + ticket)) {
        document.body.insertAdjacentHTML(
            "beforeend",
            `<style id="` + ticket + `">${style.toString()}</style>`
        );
    }
};
