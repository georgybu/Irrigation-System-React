import React, { useState } from 'react';
import { validateWeek } from '../utils/Validate';
import { Button } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import axios from 'axios';
import { firestore } from '../utils/Firebase';

import Popup from '../model/Popup';
import Day from "../components/Day";
import Cycle from '../components/Cycle';

import './MainPage.css';

let userEmail = "";

const MainPage = () => {

    const [loading, setLoading] = useState("determinate");
    const [submitMessage, setSubmitMessage] = useState("");
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
    const [textColor, setTextColor] = useState("red");

    const [week, setWeek] = useState({
        sunday: false,
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false
    });
    
    const [rounds, setRounds] = useState({
        round1: {
            isActive: false,
            startTime: null,
            endTime: null
        },
        round2: {
            isActive: false,
            startTime: null,
            endTime: null
        },
        round3: {
            isActive: false,
            startTime: null,
            endTime: null
        }
    });

    const updateRound = (round, propToUpdate, state) => {
        let updatedRound = rounds[round];

        updatedRound[propToUpdate] = state;
        let updatedRounds = {...rounds};
        updatedRounds[round] = updatedRound;
        setRounds(updatedRounds);
    }

    const updateDay = (day, state) => {
        let updatedWeek = {...week};
        updatedWeek[day] = state;
        setWeek(updatedWeek);
    }

    const setData = (email, userData) => {
        userEmail = email;

        setWeek({
            sunday: userData.sunday,
            monday: userData.monday,
            tuesday: userData.tuesday,
            wednesday: userData.wednesday,
            thursday: userData.thursday,
            friday: userData.friday,
            saturday: userData.saturday
        });


        setRounds({
            round1: {
                isActive: userData.isFirstRoundActive,
                startTime: userData.firstRoundStart,
                endTime: userData.firstRoundEnd
            },
            round2: {
                isActive: userData.isSecondRoundActive,
                startTime: userData.secondRoundStart,
                endTime: userData.secondRoundEnd
            },
            round3: {
                isActive: userData.isThirdRoundActive,
                startTime: userData.thirdRoundStart,
                endTime: userData.thirdRoundEnd
            }
        });
    }

    const setMessage = (message) => {
        setLoading("determinate");
        if (message === "Done") {
            setTextColor("green");
        }
        else {
            setTextColor("red");
        }
        setSubmitMessage(message);
    }

    const onSubmit = (event) => {
        event.preventDefault();
        setIsSubmitDisabled(true);
        setMessage("");
        setLoading("indeterminate");
        const db = firestore;

        const data = {
            ...week,
            "firstRoundStart":rounds.round1.startTime ? `${rounds.round1.startTime.split(":")[0]}:${rounds.round1.startTime.split(":")[1]}:00` : null,
            "firstRoundEnd":rounds.round1.endTime ? `${rounds.round1.endTime.split(":")[0]}:${rounds.round1.endTime.split(":")[1]}:00` : null,
            "secondRoundStart":rounds.round2.startTime ? `${rounds.round2.startTime.split(":")[0]}:${rounds.round2.startTime.split(":")[1]}:00` : null,
            "secondRoundEnd":rounds.round2.endTime ? `${rounds.round2.endTime.split(":")[0]}:${rounds.round2.endTime.split(":")[1]}:00` : null,
            "thirdRoundStart":rounds.round3.startTime ? `${rounds.round3.startTime.split(":")[0]}:${rounds.round3.startTime.split(":")[1]}:00` : null,
            "thirdRoundEnd":rounds.round3.endTime ? `${rounds.round3.endTime.split(":")[0]}:${rounds.round3.endTime.split(":")[1]}:00` : null,
            "isFirstRoundActive":rounds.round1.isActive,
            "isSecondRoundActive":rounds.round2.isActive,
            "isThirdRoundActive":rounds.round3.isActive
        }

        const validationMessage = validateWeek(data)
        
        if (validationMessage === "valid") {
            db.collection("users").doc("tamirhen6@gmail.com").get().then(user => {
                axios.post(`${user.data()["dataplicity"]}/update_week`, data).then(response => {
                    console.log("data updated successfully");
                    setMessage("Done");
                    setIsSubmitDisabled(false);
                }).catch(error => {
                    console.log(error);
                    setMessage("Connection error, please try again later");
                    setIsSubmitDisabled(false);
                })
            }).catch(error => {
                console.log(error);
                setMessage("Connection error, please try again later");
                setIsSubmitDisabled(false);
            })
        }
        else {
            setMessage(validationMessage);
            setIsSubmitDisabled(false);
        }
    }

    return (
      <React.Fragment>
        <Popup setData={setData} key="popup"/>
        <div className="main-container">
            <div className="title-wrapper">
                <h1>Home Irrigation System</h1>
            </div>
            <form className="main-form" onSubmit={onSubmit}>
                <div className="form-body">
                    <div className="form-object-wrapper">
                        {
                            Object.keys(rounds).map((keyName, keyIndex) => {
                                return (
                                    <Cycle
                                        key={keyName+rounds[keyName].isActive}
                                        isActive={rounds[keyName].isActive}
                                        cycleNumber={keyIndex + 1}
                                        startTime={rounds[keyName].startTime}
                                        endTime={rounds[keyName].endTime}
                                        updateRound={updateRound}
                                    />
                                )
                            })
                        }
                    </div>
                    <div className="form-object-wrapper">
                        <ul className="week-list">
                            {
                            Object.keys(week).map((keyName, keyIndex) => {
                                return <Day 
                                        key={keyName+week[keyName]}
                                        day={keyName}
                                        state={week[keyName]}
                                        updateDay={updateDay}
                                    />
                                })
                            }
                        </ul>
                    </div>
                </div>
                <div className="Submit-button-wrapper">
                    <Button variant="contained" color="primary" type="submit" disabled={isSubmitDisabled}>
                        Submit
                    </Button>
                </div>
                <div className="loader-wrapper">
                    <p className="submit-message" style={{color: textColor}}>{submitMessage}</p>
                    <CircularProgress
                                className="loader"
                                variant={loading}
                    />
                </div>
                
            </form>
        </div>
      </React.Fragment>
    )
}

export default MainPage;