import React, { Component } from 'react';
import LoadingPlaceholder from "./LoadingComponent"
import { Button } from 'react-bootstrap';
import "./css/popup.css"

class PopUp extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const placeholder = this.props.placeholder;
        const popUpAction = this.props.popUpAction;
        if (popUpAction === "loading") {
            return (
                <div id="popup" className='popUp'>
                    <div id="popup-content" className='popUpContent'>
                        <div id="popup-notification" className='popUpTextCentered'>
                            <LoadingPlaceholder loadingWord={placeholder} />
                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <div id="popup" className='popUp'>
                    <div id="popup-content" className='popUpContent'>
                        <div id="popup-notification" className='popUpText'>
                            {placeholder}
                        </div>
                        <Button variant="primary" className="popUpButton" id="close_popup_button" onClick={e => this.props.hidePopUp(e)}>OK</Button>
                    </div>
                </div>
            )
        }
    }

}

export default PopUp;