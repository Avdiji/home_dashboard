import { useState } from "react"
import classes from "./icon_button.module.css"

export default function IconButton(props) {
    // const [isSelected, setSelected] = useState(false);

    // const onClicked = () => {
    //     setSelected(true);
    // };

    return (
        <button>
            <img src={props.src}/>
        </button>
    )


}