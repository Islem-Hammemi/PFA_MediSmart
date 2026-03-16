import React from 'react'
import './components.css'
import {  HeartPulseIcon } from 'lucide-react'
import { MapPin} from 'lucide-react'
import { Phone} from 'lucide-react'
import { Mail} from 'lucide-react'


function Footerr() {
    return (
        <footer>
        <div className='primary-footer'>
            <div className='tst'>
                <div className="brand">
                    <div className="logo"><HeartPulseIcon/> </div>
                        <span className="brand-name">
                            <span className="s1">Medi</span><span className="s2">Smart</span>
                        </span>
                </div>

                <div className='pp'>
                    <p className='tt'>Providing expert medical care <br /> 
                    with compassion and efficiency. <br /> 
                Your health is our mission.
                </p>
                 </div>
            </div>
            
            <div className='contact-section'>
                <h3 className='contact-title'>Contact</h3>
                <div className='contact-info'>
                    <div className='contact-item'>
                        <MapPin size={15} className='contact-icon' />
                        <span className='desc'>123 Medical Center Tunis, Tunisia</span>
                    </div>
                    <div className='contact-item'>
                        <Phone size={15} className='contact-icon' />
                        <span className='desc'>+216 71 000 000</span>
                    </div>
                    <div className='contact-item'>
                        <Mail size={15} className='contact-icon' />
                        <span className='desc'>contact@medismart.tn</span>
                    </div>
                </div>
            </div>
        </div>
            <div className='copyright'>
                <p className='copy'>&copy; 2026 MediSmart. All rights reserved.</p>
            

            <div className='legal-links'>
                <p className='copy'>Privacy Policy</p>
                <p className='copy'>Terms of Service</p>
            </div>
            </div>
            
        </footer>

    )
}
export default Footerr;




