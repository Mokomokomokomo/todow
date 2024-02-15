import { useEffect } from "react";

function Redirect({url}: {url: string}) {
    useEffect(() => {
        let link = document.getElementById('redirect');

        if(link) {
            link.click();
        }
    }, []);

    return (
        <a href={url} id="redirect" style={{display: 'none'}}></a>
    )
}

export default Redirect;