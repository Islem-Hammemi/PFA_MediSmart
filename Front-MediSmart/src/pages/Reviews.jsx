import react from 'react';
import './patients.css'

import Navbarmedecin from '../components/Navbarmedecin';
import ReviewStats from '../components/ReviewStats';
import PatientReviews from '../components/PatientReviews';
import Footerr from '../components/Footerr';

function Reviews() {
    return (
        <div  className='consultation'>
            <Navbarmedecin />

            <section className="hero">
                <div className="hero-content">
                    <h1 className='hero-title'>
                       Reviews & <span className='hero-title-two'> Ratings</span>
                    </h1>
                    <p className='hero-subtitle'>
                        Track patient opinions, ratings, and overall experience at a glance.
                    </p>
                </div>
        </section>

        <ReviewStats  />
        <PatientReviews />
        <br /><br /><br /><br />
        <Footerr />
        </div>
    );
}

export default Reviews;