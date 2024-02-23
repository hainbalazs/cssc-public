/* Describe global state */
let selectedMode = 'audio'
let extraStyleRef = undefined
const resetStyle = '' +
    '.audio, .video, .tp {display: none;}\n';
let selectedModeStyle = null

window.onload = () => {
    resetPage()
    document.getElementById("select-audio-out-codec").addEventListener("change", checkMonoStereo, false);
    document.getElementById("select-audio-out-codec").addEventListener("change", alterCorrectRecommendations, false);
    document.getElementById("select-out-codec").addEventListener("change", checkCmfxBandwidthTp, false);
    document.getElementById("select-out-codec").addEventListener("change", checkCmfxTt, false);
    document.getElementById("select-out-codec").addEventListener("change", alterCorrectRecommendations, false);
};


/**  Reset global state of the page: hide output panels, reset selected mode style
*/
function createResetStyle(){
    let style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = resetStyle;
    document.getElementsByTagName('head')[0].appendChild(style);
    extraStyleRef = style;
}

function resetPage(){
    if(extraStyleRef === undefined)
        createResetStyle()
    else
        extraStyleRef.innerHTML = resetStyle

    document.getElementById('input-form').reset()
    document.getElementById('calculator-content').style.display = 'none'
    document.getElementById('output').style.display = 'none'
    document.getElementById('circle-bottom-graphics').style.display = 'none'
}

function resetSelector(){
    let audioBtn = document.getElementById('audio-sel').style;
    audioBtn.borderBottomColor = "#d8ecf4"
    audioBtn.backgroundColor = "white";

    let videoBtn = document.getElementById('video-sel').style;
    videoBtn.borderBottomColor = "#daccf0"
    videoBtn.backgroundColor = "white";

    let tpBtn = document.getElementById('tp-sel').style;
    tpBtn.borderBottomColor = "#eed2c2"
    tpBtn.backgroundColor = "white";
}

/* Mode selection */
/**
 * Displays and adapts the layout of the input forms based on the user's selection
 * @param {string} mode - The selected mode ('audio', 'video', or 'tp').
 */
async function onModeSelect(mode) {
    resetSelector()

    document.getElementById('output').style.display = 'none'
    document.getElementById('output').classList.remove("active")
    document.getElementById('circle-bottom-graphics').style.display = 'none'
    document.getElementById('circle-bottom-graphics').classList.remove("active")

    let btn = document.getElementById(mode + '-sel').style
    switch (mode) {
        case 'audio':
            btn.borderBottomColor = "#6fcdf3"
            btn.backgroundColor = "#c0e7f6"
            break
        case 'video':
            btn.borderBottomColor = "#a475ef"
            btn.backgroundColor = "#cebbee"
            break
        case 'tp':
            btn.borderBottomColor = "#efa275"
            btn.backgroundColor = "#eec2aa"
            break
        default:
            return
    }

    selectedMode = mode
    selectedModeStyle = '.' + mode + '{display: flex;}'
    extraStyleRef.innerHTML = resetStyle + selectedModeStyle

    document.getElementById('calculator-content').style.display = 'block'
    await new Promise(r => setTimeout(r, 1))
    document.getElementById('input').classList.add("active")
    document.getElementById('calculate-btn').classList.add("active")
}

/**
 * Validates the input fields on the form.
 * - Checks if required fields are filled and non-negative. (marked with the 'required' class and the stereo/mono radio switch)
 * - Applies visual feedback for validation results.
 * @returns {boolean} - True if all fields pass validation, otherwise false.
 */
function validateInput(){
    let success = true
    const requiredFields = document.querySelectorAll('.required')
    requiredFields.forEach(e => {
        if(e.value == '' || e.value < 0){
            e.style.borderBottomColor = 'red'
            e.style.borderBottomWidth = '4px'
            e.classList.add('animate__animated', 'animate__headShake')
            success = false
        } else {
            e.style.borderBottomColor = '#297fb6'
            e.style.borderBottomWidth = '1px'
        }
    })

    const r1 = document.getElementById('recording-mono')
    const r2 = document.getElementById('recording-stereo')

    const radioSection = document.getElementById('recording-mode')
    if(!r1.checked && !r2.checked){
        radioSection.style.color = 'red'
        radioSection.classList.add('animate__animated', 'animate__headShake')

    } else {
        radioSection.style.color = 'black'
    }

    return success
}

/**
 * Computes and outputs storage space requirements based on the selected mode of operation and user needs and codec properties.
 * Reads out user inputted data from the forms and outputs the computed results, triggers animations to emphasize the results.
 * @param {string} mode - The selected mode ('audio', 'video', or 'tp').
 */
function compute(mode){
    // Gather common information from the input fields (dsection1)
    const numOfLines = parseFloat(document.getElementById("if-numoflines").value)
    const callDuration = parseFloat(document.getElementById("if-callduration").value)
    const wdsPerMonth = parseFloat(document.getElementById("if-wdspermonth").value)
    const monthsStored = parseFloat(document.getElementById("if-monthsstored").value)
    let totalStorage = document.getElementById('if-available-storage').value

    // Compute bandwidth based on the selected mode
    let bandwidth = 0
    switch (mode) {
        case 'audio':
            const inCodecSamplingRate = codecs.audioInCodecSamplingRate[document.getElementById('select-in-codec').value];
            const outCodecA = codecs.audioOutCodecProperties[document.getElementById('select-audio-out-codec').value]
            const channels = document.getElementById('recording-stereo').checked ? 2 : 1

            const bandwidthA =  (outCodecA.compression === null && outCodecA.bandwidth !== null)
                ? outCodecA.bandwidth
                : outCodecA.compression * channels * inCodecSamplingRate / 1024.0

            bandwidth = bandwidthA
            break

        case 'video':
            const outCodecV = document.getElementById('select-out-codec').value
            const outBandwidthV = codecs.storageBandwidth[document.getElementById('storage-bw-slider').value]
            const bwMultiplierV = (outCodecV == 0) ? 2.4 : 1

            bandwidth = outBandwidthV * bwMultiplierV
            break

        case 'tp':
            const ctpType = document.getElementById('select-tp-room').value
            const resolution = document.getElementById('select-resolution').value
            const hasAuxAudio = document.getElementById('ch-aux-audio').checked
            const hasAuxVideo = document.getElementById('ch-aux-video').checked

            const outCodecTP = document.getElementById('select-out-codec').value
            const outBandwidthTP = codecs.storageBandwidth[document.getElementById('storage-bw-slider').value]

            const bw = (outCodecTP == 0)
                ? ((codecs.tpInBandwidth.ctp[ctpType] * codecs.tpInBandwidth.resolutionMultiplier[resolution]) + (hasAuxAudio ? codecs.tpInBandwidth.audio : 0) + (hasAuxVideo ? codecs.tpInBandwidth.video : 0))
                : outBandwidthTP

            const bwMultiplierTP = (outCodecTP == 0) ? 2.4 : 1

            bandwidth = bw * bwMultiplierTP
            break

        default:
            return
    }

    // Merge the subresults and convert bandwidth to various units
    const [hourSize, hsu] = convert(bandwidth / 8.0 * 60 * 60 / 1024.0, 'mb', 'short')
    const [daySize, dsu]  = convert(hourSize * numOfLines * callDuration / 1024.0, 'gb', 'short')
    const [monthSize, msu] = convert(daySize * wdsPerMonth, 'gb', 'short')
    const [totalSize, rsu] = convert(monthSize * monthsStored, 'gb', 'long')
    const [totalStorageS, tsu]  = convert(totalStorage, 'gb', 'long')

    // outputting the results
    document.getElementById('res-1h-call-size').innerHTML = truncate(hourSize).toString()
    document.getElementById('res-1day-call-size').innerHTML = truncate(daySize).toString()
    document.getElementById('res-1month-call-size').innerHTML = truncate(monthSize).toString()
    document.getElementById('result-req-storage').innerHTML = truncate(totalSize).toString()
    document.getElementById('result-tot-storage').innerHTML = truncate(totalStorageS).toString()
    // and the correct unit of measurements
    document.getElementById('res-1h-call-unit').innerHTML = hsu
    document.getElementById('res-1day-call-unit').innerHTML = dsu
    document.getElementById('res-1month-call-unit').innerHTML = msu
    document.getElementById('result-req-storage-unit').innerHTML = rsu
    document.getElementById('result-tot-storage-unit').innerHTML = tsu

    // Resize and show bubbles based on storage comparison
    resizeBubbles(totalSize, parseFloat(totalStorage))
    showDangerOrTick(totalSize, parseFloat(totalStorage))
}

/**
 * Calculates and displays the results based on the user input.
 * If input validation fails, the function exits early.
 * Otherwise, it triggers the computation based on the selected mode.
 * After calculation, it displays the output elements, scrolls to the result section,
 * and adds CSS classes for animation effects.
 */
function calculate() {
    if(!validateInput()){ return }
    compute(selectedMode)

    document.getElementById('output').style.display = 'block'
    document.getElementById('circle-bottom-graphics').style.display = 'block'
    // scroll + animation
    document.getElementById('scroll-here').scrollIntoView()
    document.getElementById('output').classList.add("active")
    document.getElementById('circle-bottom-graphics').classList.add("active")
    runCountAnimations()
}

const truncate = a => Math.round(a * 100) / 100;

/**
 * Number count animation up or down 
 * @param {string} mode - The selected mode ('up' or 'down').
 * @param {number} duration - The duration of the animation
 * @param {HTMLElement} element - The element containing the input value which will be animated 
 */
function count(mode, duration, element){
    const frameDuration = 1000 / 60;
    const totalFrames = Math.round( duration / frameDuration );
    const easeOutQuad = t => t * ( 2 - t );

    let frame = 0;
    const countTo = parseFloat(element.innerHTML);
    const offset = 0.3
    const countFrom = (mode === 'up') ? truncate(countTo * (1 - offset)) : truncate(countTo * (1 + offset))

    const counter = setInterval( () => {
        frame++;

        const progress = easeOutQuad( frame / totalFrames );
        const currentCount = truncate(countFrom + Math.round( (countTo - countFrom) * progress ));

        if ( parseInt( element.innerHTML, 10 ) !== currentCount ) {
            element.innerHTML = currentCount;
        }

        if ( frame === totalFrames ) {
            element.innerHTML = countTo;
            clearInterval( counter );
        }
    }, frameDuration );
}

/** Run the animation on all elements with a class of ‘count...’
 */ 
function runCountAnimations(){
    const countupEls = document.querySelectorAll( '.countup' );
    countupEls.forEach( e => count('up', 900, e) );

    const countdownEls = document.querySelectorAll( '.countdown' );
    countdownEls.forEach( e => count('down', 900, e) );
}

/* Alter the layout of the output forms based on the user input */
function checkCmfxTt(){
    const isCMFX = document.getElementById('select-out-codec').value == 0
    const tooltips = document.querySelectorAll('.vid-dd-helper')
    if(isCMFX){
        tooltips.forEach(tt => tt.classList.remove('hidden'))
    } else {
        tooltips.forEach(tt => tt.classList.add('hidden'))
    }
}

function checkMonoStereo() {
    const selectedInCodec = document.getElementById("select-audio-out-codec").value
    if(!codecs.audioOutCodecProperties[selectedInCodec].isStereo){
        document.getElementById('just-mono').classList.remove('hidden')
        document.getElementById('mono-and-stereo').classList.add('hidden')
    } else {
        document.getElementById('just-mono').classList.add('hidden')
        document.getElementById('mono-and-stereo').classList.remove('hidden')
    }
}

function checkCmfxBandwidthTp(){
    const isCMFX = document.getElementById('select-out-codec').value == 0
    if(isCMFX && selectedMode === 'tp'){
        document.getElementById('storage-bw-sec').classList.add('hidden')
    } else {
        document.getElementById('storage-bw-sec').classList.remove('hidden')
    }
}

/**
 * Converts an amount from the given unit to another such that the displayed amount is \in [1, 1024).
 * @param {number} amount - The amount to be converted.
 * @param {string} current_unit - The current unit of the amount (e.g., 'kb', 'mb').
 * @param {string} format - The text format of the output unit ('short' or 'long').
 * @returns {Array} - An array containing the converted amount and its unit.
 */
function convert(amount, current_unit, format) {
  const units = [['kb', 'kilobyte'], ['mb', 'megabyte'], ['gb', 'gigabyte'], ['tb', 'terrabyte'], ['pb', 'petabyte']]
  let unit_idx = units.findIndex(u => u[0] == current_unit)

    // Convert the amount to a larger unit if it exceeds 1024 and the current unit is not the largest unit
    while(amount > 1024 && unit_idx < units.length) {
        amount /= 1024
        unit_idx++
    }

    // Convert the amount to a smaller unit if it is less than 1 and the current unit is not the smallest unit
    while(amount < 1 && unit_idx > 0) {
        amount *= 1024
        unit_idx--
    }

    // Return the converted amount and its unit in the specified text format (short - abbreviation or long - written out)
    return [amount, units[unit_idx][(format === 'long' ? 1 : 0)]]
}

/* Animations shown to illustrate the results */

/**
 * Resizes bubbles representing required and total storage based on their respective sizes.
 * @param {number} requiredS - The size of the required storage.
 * @param {number} totalS - The size of the total available storage.
 */
function resizeBubbles(requiredS, totalS){
    const sum = requiredS + totalS
    const rqSize = (requiredS / sum * 20) + 30
    const ttSize = (totalS / sum * 20) + 30

    const rqBubbles = document.querySelectorAll( '.result-req' )
    rqBubbles.forEach(b => {
        b.style.width = rqSize.toString() + '%'
    })

    const ttBubbles = document.querySelectorAll( '.result-tot' )
    ttBubbles.forEach(b => b.style.width =ttSize.toString() + '%')
}

/**
 * Determines whether there is enough storage based on the provided values and updates the UI accordingly
 * (with either a danger or tick sign).
 * @param {number} rs - The required storage size.
 * @param {number} ts - The total available storage size.
 */
function showDangerOrTick(rs, ts){
    const el = document.getElementById('danger-or-tick')
    const els = document.querySelectorAll('.conclusion-text')
    
    // Determine if there is enough storage
    const b = (rs <= ts)

    // Set the image and title and style of the element based on whether there is enough storage
    el.src = b ? 'img/tick.png' : 'img/danger.png'
    el.title = b ? 'Enough storage' : 'Not enough storage'
    els.forEach(ct => {
        ct.style.color = b ? '#297fb6' : '#e96800'
        ct.innerHTML = b ? 'Sufficient' : 'Insufficient'
    })
}

/* Providing Codec recommendations based on user preferences*/

/**
 * Shows or hides recommendation buttons based on the selected mode and codec rankings.
 * Removes the currently shown codec from the recommendations.
 */
function alterCorrectRecommendations(){
    // Get recommendation buttons for highest quality and most efficient codecs
    const hqBtn = document.getElementById('rec-hq')
    const meBtn = document.getElementById('rec-me')
    
    // Hide or show the most highestQuality/mostEfficientrecommendation button based on the selected codec and the mode
    if(selectedMode === 'audio'){
        const selectedCCA = document.getElementById('select-audio-out-codec').value
        if(selectedCCA == codecs.codecRanking.highestQuality.audio){
            hqBtn.classList.add('hidden')
        } else {
            hqBtn.classList.remove('hidden')
        }
        if(selectedCCA == codecs.codecRanking.mostEfficient.audio){
            meBtn.classList.add('hidden')
        } else {
            meBtn.classList.remove('hidden')
        }
    } else {
        const selectedCC = document.getElementById('select-out-codec').value
        if(selectedCC == codecs.codecRanking.highestQuality.video){
            hqBtn.classList.add('hidden')
        } else {
            hqBtn.classList.remove('hidden')
        }
        if(selectedCC == codecs.codecRanking.mostEfficient.video){
            meBtn.classList.add('hidden')
        } else {
            meBtn.classList.remove('hidden')
        }
    }
}

/**
 * (Re)Selects the recommended codec based on the selected mode and recommendation type, and recalculate the storage space setting accordingly.
 * @param {string} type - The type of recommendation ('me' for most efficient, 'hq' for highest quality).
 */
function selectRecommendedCodec(type){
    // Determine which selector to use based on the selected mode
    const selector = (selectedMode === 'audio')
        ? document.getElementById('select-audio-out-codec')
        : document.getElementById('select-out-codec')
    
    // Set the value of the selector based on the recommendation type and update the state of the selector
    selector.value = (type === 'me') ? codecs.codecRanking.mostEfficient[selectedMode] : codecs.codecRanking.highestQuality[selectedMode]
    selector.dispatchEvent(new Event('change'))

    // Trigger the 'calculate' function to update the calculation based on the new codec selection
    calculate()
}
