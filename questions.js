// Public question data. Assessment answers are NOT here: they live only in Code.gs (server).
const NAMES = ["Transmitter","Receiver","Antenna","Filter","Amplifier","Mixer"];
const LEARN = {
 Transmitter:{def:"The unit that converts the message signal into a radio signal ready to be sent.",fn:"Modulates a carrier with the message, then boosts it for transmission.",work:"The message modulates a high-frequency carrier; mixers set the frequency, a power amplifier raises the power and a filter removes unwanted emissions.",app:"Phone handset, FM station, Wi-Fi router, IoT sensor node.",ex:"When you speak on a walkie-talkie, the transmitter turns your voice into a radio signal."},
 Receiver:{def:"The unit that picks up the radio signal and recovers the original message.",fn:"Selects, amplifies and demodulates the wanted signal.",work:"The antenna signal passes through a filter, a low-noise amplifier and a mixer, then a demodulator recovers the message.",app:"Car radio, TV set, GPS receiver, smart-home hub.",ex:"A car radio tuned to 98.3 MHz recovers the song from the FM signal."},
 Antenna:{def:"A conductor structure that converts electrical signals to radio waves and back.",fn:"Radiates the signal into space (Tx) and captures it from space (Rx).",work:"Alternating current in the antenna creates electromagnetic waves; incoming waves induce a small current.",app:"Mobile towers, Wi-Fi routers, satellite dishes, RFID tags.",ex:"The rod on an old radio is a receiving antenna."},
 Filter:{def:"A circuit that passes wanted frequencies and blocks unwanted ones.",fn:"Rejects noise, interference and harmonics.",work:"Inductors, capacitors or resonators give a response that passes a chosen band and attenuates the rest.",app:"Channel selection in radios, 4G/5G band filters, noise removal in sensors.",ex:"Tuning a radio to one station uses a band-pass filter to reject the others."},
 Amplifier:{def:"A circuit that increases the power or amplitude of a signal.",fn:"Boosts weak signals (LNA in a receiver) or sets output power (PA in a transmitter).",work:"A transistor uses a DC supply to produce a larger copy of the input signal.",app:"Cell-tower power amplifiers, satellite receivers, Wi-Fi boosters.",ex:"A GPS receiver uses a low-noise amplifier to boost the very faint satellite signal."},
 Mixer:{def:"A circuit that shifts a signal from one frequency to another.",fn:"Frequency conversion (up-conversion in Tx, down-conversion in Rx).",work:"It multiplies the signal with a local oscillator, producing sum and difference frequencies; a filter keeps the one needed.",app:"Superheterodyne radios, mobile phones, radar, satellite links.",ex:"An FM radio mixes 98 MHz with an oscillator to get a fixed 10.7 MHz signal."}
};
const MATCH_PRACTICE = NAMES.map(n=>({n, f:LEARN[n].fn}));
const IDENT = [
 {q:"A phone mast sends your call into the air as radio waves. Which part does the radiating?",o:["Antenna","Filter","Mixer"],a:0,e:"The antenna converts the electrical signal into radio waves."},
 {q:"A radio converts a 98 MHz signal to 10.7 MHz. Which component does this?",o:["Amplifier","Mixer","Transmitter"],a:1,e:"A mixer shifts signals between frequencies."},
 {q:"Your Wi-Fi picks up a neighbour's strong signal on an adjacent channel. What rejects it?",o:["Filter","Antenna","Receiver"],a:0,e:"A band-pass filter passes the wanted channel and blocks others."},
 {q:"A voice is turned into an RF signal for broadcast. Which block does this?",o:["Receiver","Mixer","Transmitter"],a:2,e:"The transmitter modulates and prepares the signal."}
];
const SITU_PRACTICE = [
 {q:"A satellite signal arrives extremely weak at the dish. What do you add right after the antenna?",o:["Low-noise amplifier","Power amplifier","Mixer"],a:0,e:"A low-noise amplifier boosts weak signals while adding little noise."},
 {q:"A sensor node's signal fades before reaching the gateway 2 km away. Which Tx part sets output power?",o:["Filter","Power amplifier","Receiver"],a:1,e:"The power amplifier raises transmit power."},
 {q:"A smart-meter receiver hears interference from a nearby radar band. What helps most?",o:["Band-pass filter","Bigger battery","Mixer"],a:0,e:"A band-pass filter attenuates out-of-band signals."}
];
const ARRANGE = ["Information source","Transmitter","Transmit antenna","Receive antenna","Receiver","Destination"];

// Assessment (answers hidden)
const MCQ = [
 {id:"m1",q:"Which block converts the message into a signal suitable for radio transmission?",o:["Receiver","Transmitter","Filter","Mixer"]},
 {id:"m2",q:"Which component radiates and captures electromagnetic waves?",o:["Mixer","Amplifier","Antenna","Filter"]},
 {id:"m3",q:"A band-pass filter is used to:",o:["Pass only a chosen range of frequencies","Increase signal power","Shift frequency","Generate the carrier"]},
 {id:"m4",q:"The main purpose of an amplifier is to:",o:["Change the frequency","Increase signal level","Radiate waves","Reject noise"]},
 {id:"m5",q:"A mixer's output contains:",o:["Only the input frequency","Sum and difference frequencies","Only DC","Only noise"]},
 {id:"m6",q:"The amplifier placed right after the receive antenna is usually a:",o:["Power amplifier","Low-noise amplifier","Audio amplifier","Class-C amplifier"]},
 {id:"m7",q:"The main job of a receiver is to:",o:["Radiate power","Recover the original information","Generate the message","Store data"]},
 {id:"m8",q:"Why is a low-noise amplifier used in receivers?",o:["To boost weak signals with little added noise","To cut power use","To radiate more power","To select a station"]},
 {id:"m9",q:"Which block shifts a signal from one frequency to another?",o:["Filter","Antenna","Mixer","Receiver"]},
 {id:"m10",q:"In a transmitter chain, the signal finally goes to the:",o:["Demodulator","Antenna","Source","Speaker"]}
];
const MATCH = [
 {id:"t1",f:"Radiates and captures radio waves"},
 {id:"t2",f:"Rejects unwanted frequencies and noise"},
 {id:"t3",f:"Shifts a signal to a new frequency"},
 {id:"t4",f:"Recovers the original information from the radio signal"},
 {id:"t5",f:"Prepares the message as an RF signal and sends it out"}
];
const SITU = [
 {id:"s1",q:"Your phone call has hiss from a strong nearby channel. Which component should reject it?",o:["Filter","Mixer","Transmitter","Antenna"]},
 {id:"s2",q:"The signal from a distant tower is very weak at the receiver input. What should come first?",o:["Mixer","Low-noise amplifier","Power amplifier","Transmitter"]},
 {id:"s3",q:"An FM radio must convert 98 MHz to a fixed 10.7 MHz. Which component?",o:["Mixer","Filter","Antenna","Amplifier"]},
 {id:"s4",q:"A router's coverage is poor in one direction. Which component do you upgrade?",o:["Mixer","Filter","High-gain antenna","Receiver"]},
 {id:"s5",q:"In a walkie-talkie, speech must be placed on a carrier wave. Which block does this?",o:["Transmitter","Receiver","Filter","Antenna"]}
];
