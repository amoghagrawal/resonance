    let audioContext = null;
    let oscillator = null;
    let filter = null;
    let gainNode = null;
    let lfo = null;
    let lpf2 = null;
    let isPlaying = false;
    let reverb1 = null;
    let reverb1Wet = null;
    let reverb1Dry = null;
    let echo = null;
    let echoDelay = null;
    let echoFeedback = null;
    let echoWet = null;
    let echoDry = null;
    let analyser = null;
    let scopeCanvas = null;
    let scopeCtx = null;
    let animationFrame = null;
    let distortion = null;
    let distWet = null;
    let distDry = null;
    let sequencer = null;
    let sequencerInterval = null;
    let currentStep = 0;
    let isSequencerPlaying = false;
    let baseFrequencies = [130.81, 146.83, 164.81, 174.61, 196.00, 220.00, 246.94, 261.63];
    let lpf4 = null;
    let flangerDelay = null;
    let flangerFeedback = null;
    let flangerLFO = null;
    let flangerDepth = null;
    let chorusDelay = null;
    let chorusLFO = null;
    let chorusDepth = null;
    let chorusMix = null;
    let chorusDry = null;
    let moduleStates = {
      vco: true,
      lfo: false,
      vcf: false,
      env: false,
      reverb1: false,
      echo: false,
      scope: true,
      dist: false,
      seq: false,
      lpf2: false,
      lpf4: false,
      flanger: false,
      chorus: false
    };
    function initAudio() {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        setupAudio();
      }
    }
    function setupAudio() {
      if (!audioContext) return;
      filter = audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      lpf2 = audioContext.createBiquadFilter();
      lpf2.type = 'lowpass';
      lpf2.frequency.value = parseFloat(document.getElementById('lpf2Cutoff').value);
      lpf2.Q.value = parseFloat(document.getElementById('lpf2Resonance').value);
      lpf4 = audioContext.createBiquadFilter();
      lpf4.type = 'lowpass';
      lpf4.frequency.value = parseFloat(document.getElementById('lpf4Cutoff').value);
      lpf4.Q.value = parseFloat(document.getElementById('lpf4Resonance').value);
      gainNode = audioContext.createGain();
      gainNode.gain.value = 0;
      reverb1 = audioContext.createConvolver();
      reverb1Wet = audioContext.createGain();
      reverb1Dry = audioContext.createGain();
      const reverbMix = parseFloat(document.getElementById('reverbMix1').value) / 100;
      reverb1Wet.gain.value = reverbMix;
      reverb1Dry.gain.value = 1 - reverbMix;
      createImpulseResponse(reverb1, parseFloat(document.getElementById('reverbDecay1').value));
      distortion = audioContext.createWaveShaper();
      distWet = audioContext.createGain();
      distDry = audioContext.createGain();
      const distDrive = parseInt(document.getElementById('distDrive').value);
      const distMix = parseFloat(document.getElementById('distMix').value) / 100;
      distortion.curve = makeDistortionCurve(distDrive);
      distWet.gain.value = distMix;
      distDry.gain.value = 1 - distMix;
      echoDelay = audioContext.createDelay();
      echoFeedback = audioContext.createGain();
      echoWet = audioContext.createGain();
      echoDry = audioContext.createGain();
      echoDelay.delayTime.value = parseFloat(document.getElementById('echoTime').value);
      echoFeedback.gain.value = parseFloat(document.getElementById('echoFeedback').value) / 100;
      const echoMix = parseFloat(document.getElementById('echoMix').value) / 100;
      echoWet.gain.value = echoMix;
      echoDry.gain.value = 1 - echoMix;
      flangerDelay = audioContext.createDelay();
      flangerFeedback = audioContext.createGain();
      flangerLFO = audioContext.createOscillator();
      flangerDepth = audioContext.createGain();
      flangerDelay.delayTime.value = parseFloat(document.getElementById('flangerDelay').value);
      flangerFeedback.gain.value = parseFloat(document.getElementById('flangerFeedback').value);
      flangerLFO.frequency.value = parseFloat(document.getElementById('flangerRate').value);
      flangerDepth.gain.value = parseFloat(document.getElementById('flangerDepth').value);
      chorusDelay = audioContext.createDelay();
      chorusLFO = audioContext.createOscillator();
      chorusDepth = audioContext.createGain();
      chorusMix = audioContext.createGain();
      chorusDry = audioContext.createGain();
      chorusDelay.delayTime.value = parseFloat(document.getElementById('chorusDelay').value);
      chorusLFO.frequency.value = parseFloat(document.getElementById('chorusRate').value);
      chorusDepth.gain.value = parseFloat(document.getElementById('chorusDepth').value);
      const chorusMixValue = parseFloat(document.getElementById('chorusMix').value) / 100;
      chorusMix.gain.value = chorusMixValue;
      chorusDry.gain.value = 1 - chorusMixValue;
      var oscillator = audioContext.createOscillator();
      if (moduleStates.lpf2) {
        if (moduleStates.dist) {
          if (moduleStates.vcf && moduleStates.echo) {
            oscillator.connect(reverb1);
            reverb1.connect(distortion);
            distortion.connect(distWet);
            reverb1.connect(distDry);
            distWet.connect(echoDelay);
            distDry.connect(echoDry);
            echoDelay.connect(echoFeedback);
            echoFeedback.connect(echoDelay);
            echoDelay.connect(echoWet);
            echoWet.connect(filter);
            echoDry.connect(filter);
            filter.connect(lpf2);
            if (moduleStates.lpf4) {
              lpf2.connect(lpf4);
            }
          } else if (moduleStates.echo) {
            oscillator.connect(reverb1);
            reverb1.connect(distortion);
            distortion.connect(distWet);
            reverb1.connect(distDry);
            distWet.connect(echoDelay);
            distDry.connect(echoDry);
            echoDelay.connect(echoFeedback);
            echoFeedback.connect(echoDelay);
            echoDelay.connect(echoWet);
            echoWet.connect(lpf2);
            echoDry.connect(lpf2);
            if (moduleStates.lpf4) {
              lpf2.connect(lpf4);
            }
          } else if (moduleStates.vcf) {
            oscillator.connect(reverb1);
            reverb1.connect(distortion);
            distortion.connect(distWet);
            reverb1.connect(distDry);
            distWet.connect(filter);
            distDry.connect(filter);
            filter.connect(lpf2);
            if (moduleStates.lpf4) {
              lpf2.connect(lpf4);
            }
          } else {
            oscillator.connect(reverb1);
            reverb1.connect(distortion);
            distortion.connect(distWet);
            reverb1.connect(distDry);
            distWet.connect(lpf2);
            distDry.connect(lpf2);
            if (moduleStates.lpf4) {
              lpf2.connect(lpf4);
            }
          }
        } else {
          if (moduleStates.vcf && moduleStates.echo) {
            oscillator.connect(reverb1);
            reverb1Wet.connect(echoDelay);
            reverb1Dry.connect(echoDry);
            echoDelay.connect(echoFeedback);
            echoFeedback.connect(echoDelay);
            echoDelay.connect(echoWet);
            echoWet.connect(filter);
            echoDry.connect(filter);
            filter.connect(lpf2);
            if (moduleStates.lpf4) {
              lpf2.connect(lpf4);
            } else {}
          } else if (moduleStates.echo) {
            oscillator.connect(reverb1);
            reverb1Wet.connect(echoDelay);
            reverb1Dry.connect(echoDry);
            echoDelay.connect(echoFeedback);
            echoFeedback.connect(echoDelay);
            echoDelay.connect(echoWet);
            echoWet.connect(lpf2);
            echoDry.connect(lpf2);
            if (moduleStates.lpf4) {
              lpf2.connect(lpf4);
            } else {}
          } else if (moduleStates.vcf) {
            oscillator.connect(reverb1);
            reverb1Wet.connect(filter);
            reverb1Dry.connect(filter);
            filter.connect(lpf2);
            if (moduleStates.lpf4) {
              lpf2.connect(lpf4);
            } else {}
          } else {
            oscillator.connect(reverb1);
            reverb1Wet.connect(lpf2);
            reverb1Dry.connect(lpf2);
            if (moduleStates.lpf4) {
              lpf2.connect(lpf4);
            } else {}
          }
        }
      } else {
        if (moduleStates.lpf4) {
          if (moduleStates.dist) {
            if (moduleStates.vcf && moduleStates.echo) {
              oscillator.connect(reverb1);
              reverb1.connect(distortion);
              distortion.connect(distWet);
              reverb1.connect(distDry);
              distWet.connect(echoDelay);
              distDry.connect(echoDry);
              echoDelay.connect(echoFeedback);
              echoFeedback.connect(echoDelay);
              echoDelay.connect(echoWet);
              echoWet.connect(filter);
              echoDry.connect(filter);
              filter.connect(lpf4);
            } else if (moduleStates.echo) {
              oscillator.connect(reverb1);
              reverb1.connect(distortion);
              distortion.connect(distWet);
              reverb1.connect(distDry);
              distWet.connect(echoDelay);
              distDry.connect(echoDry);
              echoDelay.connect(echoFeedback);
              echoFeedback.connect(echoDelay);
              echoDelay.connect(echoWet);
              echoWet.connect(lpf4);
              echoDry.connect(lpf4);
            } else if (moduleStates.vcf) {
              oscillator.connect(reverb1);
              reverb1.connect(distortion);
              distortion.connect(distWet);
              reverb1.connect(distDry);
              distWet.connect(filter);
              distDry.connect(filter);
              filter.connect(lpf4);
            } else {
              oscillator.connect(reverb1);
              reverb1.connect(distortion);
              distortion.connect(distWet);
              reverb1.connect(distDry);
              distWet.connect(lpf4);
              distDry.connect(lpf4);
            }
          } else {
            if (moduleStates.vcf && moduleStates.echo) {
              oscillator.connect(reverb1);
              reverb1Wet.connect(echoDelay);
              reverb1Dry.connect(echoDry);
              echoDelay.connect(echoFeedback);
              echoFeedback.connect(echoDelay);
              echoDelay.connect(echoWet);
              echoWet.connect(filter);
              echoDry.connect(filter);
              filter.connect(lpf4);
            } else if (moduleStates.echo) {
              oscillator.connect(reverb1);
              reverb1Wet.connect(echoDelay);
              reverb1Dry.connect(echoDry);
              echoDelay.connect(echoFeedback);
              echoFeedback.connect(echoDelay);
              echoDelay.connect(echoWet);
              echoWet.connect(lpf4);
              echoDry.connect(lpf4);
            } else if (moduleStates.vcf) {
              oscillator.connect(reverb1);
              reverb1Wet.connect(filter);
              reverb1Dry.connect(filter);
              filter.connect(lpf4);
            } else {
              oscillator.connect(reverb1);
              reverb1Wet.connect(lpf4);
              reverb1Dry.connect(lpf4);
            }
          }
        } else {
          if (moduleStates.dist) {
            if (moduleStates.vcf && moduleStates.echo) {
              oscillator.connect(reverb1);
              reverb1.connect(distortion);
              distortion.connect(distWet);
              reverb1.connect(distDry);
              distWet.connect(echoDelay);
              distDry.connect(echoDry);
              echoDelay.connect(echoFeedback);
              echoFeedback.connect(echoDelay);
              echoDelay.connect(echoWet);
              echoWet.connect(filter);
              echoDry.connect(filter);
              filter.connect(gainNode);
            } else if (moduleStates.echo) {
              oscillator.connect(reverb1);
              reverb1.connect(distortion);
              distortion.connect(distWet);
              reverb1.connect(distDry);
              distWet.connect(echoDelay);
              distDry.connect(echoDry);
              echoDelay.connect(echoFeedback);
              echoFeedback.connect(echoDelay);
              echoDelay.connect(echoWet);
              echoWet.connect(gainNode);
              echoDry.connect(gainNode);
            } else if (moduleStates.vcf) {
              oscillator.connect(reverb1);
              reverb1.connect(distortion);
              distortion.connect(distWet);
              reverb1.connect(distDry);
              distWet.connect(filter);
              distDry.connect(filter);
              filter.connect(gainNode);
            } else {
              oscillator.connect(reverb1);
              reverb1.connect(distortion);
              distortion.connect(distWet);
              reverb1.connect(distDry);
              distWet.connect(gainNode);
              distDry.connect(gainNode);
            }
          } else {
            if (moduleStates.vcf && moduleStates.echo) {
              oscillator.connect(reverb1);
              reverb1Wet.connect(echoDelay);
              reverb1Dry.connect(echoDry);
              echoDelay.connect(echoFeedback);
              echoFeedback.connect(echoDelay);
              echoDelay.connect(echoWet);
              echoWet.connect(filter);
              echoDry.connect(filter);
              filter.connect(gainNode);
            } else if (moduleStates.echo) {
              oscillator.connect(reverb1);
              reverb1Wet.connect(echoDelay);
              reverb1Dry.connect(echoDry);
              echoDelay.connect(echoFeedback);
              echoFeedback.connect(echoDelay);
              echoDelay.connect(echoWet);
              echoWet.connect(gainNode);
              echoDry.connect(gainNode);
            } else if (moduleStates.vcf) {
              oscillator.connect(reverb1);
              reverb1Wet.connect(filter);
              reverb1Dry.connect(filter);
              filter.connect(gainNode);
            } else {
              oscillator.connect(reverb1);
              reverb1Wet.connect(gainNode);
              reverb1Dry.connect(gainNode);
            }
          }
        }
      }
      if (moduleStates.chorus) {
        chorusLFO.connect(chorusDepth);
        chorusDepth.connect(chorusDelay.delayTime);
        chorusDelay.connect(chorusMix);
        chorusLFO.start();
        gainNode.disconnect();
        gainNode.connect(chorusDelay);
        gainNode.connect(chorusDry);
        chorusMix.connect(audioContext.destination);
        chorusDry.connect(audioContext.destination);
        if (moduleStates.scope) {
          chorusMix.connect(analyser);
          chorusDry.connect(analyser);
        }
      } else {
        if (moduleStates.flanger) {
          flangerLFO.connect(flangerDepth);
          flangerDepth.connect(flangerDelay.delayTime);
          flangerDelay.connect(flangerFeedback);
          flangerFeedback.connect(flangerDelay);
          flangerLFO.start();
          if (moduleStates.lpf4) {
            lpf4.disconnect();
            lpf4.connect(flangerDelay);
            flangerDelay.connect(gainNode);
          } else if (moduleStates.lpf2) {
            lpf2.disconnect();
            lpf2.connect(flangerDelay);
            flangerDelay.connect(gainNode);
          } else {
            gainNode.disconnect();
            gainNode.connect(flangerDelay);
            flangerDelay.connect(audioContext.destination);
          }
        } else {
          if (moduleStates.lpf4) {
            lpf4.connect(gainNode);
          } else if (moduleStates.lpf2) {
            lpf2.connect(gainNode);
          } else {
            gainNode.connect(audioContext.destination);
          }
        }
      }
      if (moduleStates.scope) {
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        gainNode.connect(analyser);
        analyser.connect(audioContext.destination);
      } else {
        if (moduleStates.flanger) {
          gainNode.connect(audioContext.destination);
        }
      }
    }
    function createOscillator() {
      if (!audioContext) return;
      oscillator = audioContext.createOscillator();
      oscillator.type = document.getElementById('waveform').value;
      oscillator.frequency.value = parseFloat(document.getElementById('frequency').value);
      if (moduleStates.vco) {
        if (moduleStates.reverb1) {
          oscillator.connect(reverb1);
          reverb1.connect(reverb1Wet);
          oscillator.connect(reverb1Dry);
        } else {
          if (moduleStates.vcf && moduleStates.echo) {
            oscillator.connect(echoDelay);
            echoDelay.connect(echoFeedback);
            echoFeedback.connect(echoDelay);
            echoDelay.connect(echoWet);
            oscillator.connect(echoDry);
            echoWet.connect(filter);
            echoDry.connect(filter);
            filter.connect(gainNode);
          } else if (moduleStates.vcf) {
            oscillator.connect(filter);
          } else if (moduleStates.echo) {
            oscillator.connect(echoDelay);
            echoDelay.connect(echoFeedback);
            echoFeedback.connect(echoDelay);
            echoDelay.connect(echoWet);
            oscillator.connect(echoDry);
            echoWet.connect(gainNode);
            echoDry.connect(gainNode);
          } else {
            oscillator.connect(gainNode);
          }
        }
      }
      if (moduleStates.lfo) {
        createLFO();
      }
    }
    function updateFilter() {
      if (!filter) return;
      filter.frequency.value = parseFloat(document.getElementById('cutoff').value);
      filter.Q.value = parseFloat(document.getElementById('resonance').value);
    }
    function createImpulseResponse(reverb, decay) {
      const sampleRate = audioContext.sampleRate;
      const length = sampleRate * decay;
      const impulse = audioContext.createBuffer(2, length, sampleRate);
      for (let channel = 0; channel < 2; channel++) {
        const channelData = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
          channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
        }
      }
      reverb.buffer = impulse;
    }
    function updateReverbMix(reverbNum) {
      if (!audioContext || !reverb1Wet || !reverb1Dry) return;
      const mix = parseFloat(document.getElementById(`reverbMix${reverbNum}`).value) / 100;
      reverb1Wet.gain.value = mix;
      reverb1Dry.gain.value = 1 - mix;
    }
    function makeDistortionCurve(amount) {
      const samples = 44100;
      const curve = new Float32Array(samples);
      const deg = Math.PI / 180;
      for (let i = 0; i < samples; ++i) {
        const x = i * 2 / samples - 1;
        curve[i] = (3 + amount) * Math.atan(x * 20 * deg) / (Math.PI + amount * Math.abs(x));
      }
      return curve;
    }
    const playButton = document.getElementById('playButton');
    const led = document.getElementById('led');
    document.querySelectorAll('.module-switch').forEach(switchElement => {
      switchElement.addEventListener('change', e => {
        const module = e.target.dataset.module;
        moduleStates[module] = e.target.checked;
        if (isPlaying) {
          oscillator.stop();
          if (lfo) lfo.stop();
          setupAudio();
          if (module === 'scope' && !e.target.checked) {
            if (animationFrame) {
              cancelAnimationFrame(animationFrame);
              scopeCtx.fillStyle = '#0a0a0a';
              scopeCtx.fillRect(0, 0, scopeCanvas.width, scopeCanvas.height);
            }
          } else if (module === 'scope' && e.target.checked) {
            setupOscilloscope();
          }
          createOscillator();
          oscillator.start();
          if (moduleStates.env) {
            const attackTime = parseFloat(document.getElementById('attack').value);
            gainNode.gain.cancelScheduledValues(audioContext.currentTime);
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + attackTime);
          } else {
            gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
          }
        }
      });
    });
    playButton.addEventListener('click', () => {
      initAudio();
      if (!isPlaying && audioContext) {
        createOscillator();
        if (moduleStates.scope) {
          setupOscilloscope();
        }
        const attackTime = parseFloat(document.getElementById('attack').value);
        oscillator.start();
        gainNode.gain.cancelScheduledValues(audioContext.currentTime);
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        if (moduleStates.env) {
          gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + attackTime);
        } else {
          gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        }
        isPlaying = true;
        led.classList.add('active');
        playButton.classList.add('active');
      } else if (isPlaying && audioContext && oscillator) {
        const releaseTime = parseFloat(document.getElementById('release').value);
        if (moduleStates.env) {
          gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + releaseTime);
        } else {
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        }
        oscillator.stop(audioContext.currentTime + releaseTime);
        if (lfo) {
          lfo.stop(audioContext.currentTime + releaseTime);
        }
        isPlaying = false;
        led.classList.remove('active');
        playButton.classList.remove('active');
      }
    });
    document.getElementById('frequency').addEventListener('input', e => {
      document.getElementById('freqValue').textContent = e.target.value + ' Hz';
      if (oscillator) {
        oscillator.frequency.value = e.target.value;
      }
    });
    document.getElementById('cutoff').addEventListener('input', e => {
      document.getElementById('cutoffValue').textContent = e.target.value + ' Hz';
      updateFilter();
    });
    document.getElementById('resonance').addEventListener('input', e => {
      document.getElementById('resValue').textContent = e.target.value;
      updateFilter();
    });
    document.getElementById('attack').addEventListener('input', e => {
      document.getElementById('attackValue').textContent = e.target.value + 's';
    });
    document.getElementById('release').addEventListener('input', e => {
      document.getElementById('releaseValue').textContent = e.target.value + 's';
    });
    document.getElementById('waveform').addEventListener('change', e => {
      if (oscillator) {
        oscillator.type = e.target.value;
      }
    });
    document.getElementById('lfoFrequency').addEventListener('input', e => {
      document.getElementById('lfoFreqValue').textContent = e.target.value + ' Hz';
      if (lfo) {
        lfo.frequency.value = e.target.value;
      }
    });
    document.getElementById('lfoAmount').addEventListener('input', e => {
      document.getElementById('lfoAmountValue').textContent = e.target.value + '%';
      if (isPlaying) {
        oscillator.stop();
        lfo.stop();
        createOscillator();
        oscillator.start();
      }
    });
    document.getElementById('lfoWaveform').addEventListener('change', e => {
      if (lfo) {
        lfo.type = e.target.value;
      }
    });
    document.getElementById('reverbMix1').addEventListener('input', e => {
      if (!audioContext) initAudio();
      document.getElementById('reverbMix1Value').textContent = e.target.value + '%';
      updateReverbMix(1);
    });
    document.getElementById('reverbDecay1').addEventListener('input', e => {
      document.getElementById('reverbDecay1Value').textContent = e.target.value + 's';
      if (reverb1) {
        createImpulseResponse(reverb1, parseFloat(e.target.value));
      }
    });
    document.getElementById('echoTime').addEventListener('input', e => {
      document.getElementById('echoTimeValue').textContent = e.target.value + 's';
      if (echoDelay) {
        echoDelay.delayTime.value = parseFloat(e.target.value);
      }
    });
    document.getElementById('echoFeedback').addEventListener('input', e => {
      document.getElementById('echoFeedbackValue').textContent = e.target.value + '%';
      if (echoFeedback) {
        echoFeedback.gain.value = parseFloat(e.target.value) / 100;
      }
    });
    document.getElementById('echoMix').addEventListener('input', e => {
      document.getElementById('echoMixValue').textContent = e.target.value + '%';
      if (echoWet && echoDry) {
        const mix = parseFloat(e.target.value) / 100;
        echoWet.gain.value = mix;
        echoDry.gain.value = 1 - mix;
      }
    });
    document.getElementById('distDrive').addEventListener('input', e => {
      document.getElementById('distDriveValue').textContent = e.target.value;
      if (distortion) {
        const drive = parseInt(e.target.value);
        distortion.curve = makeDistortionCurve(drive);
        distortion.oversample = drive > 50 ? '4x' : '2x';
      }
    });
    document.getElementById('distMix').addEventListener('input', e => {
      document.getElementById('distMixValue').textContent = e.target.value + '%';
      if (distWet && distDry) {
        const mix = parseFloat(e.target.value) / 100;
        distWet.gain.value = mix;
        distDry.gain.value = 1 - mix;
      }
    });
    document.getElementById('lpf2Cutoff').addEventListener('input', e => {
      document.getElementById('lpf2CutoffValue').textContent = e.target.value + ' Hz';
      if (lpf2) {
        lpf2.frequency.value = e.target.value;
      }
    });
    document.getElementById('lpf2Resonance').addEventListener('input', e => {
      document.getElementById('lpf2ResValue').textContent = e.target.value;
      if (lpf2) {
        lpf2.Q.value = e.target.value;
      }
    });
    document.getElementById('lpf4Cutoff').addEventListener('input', e => {
      document.getElementById('lpf4CutoffValue').textContent = e.target.value + ' Hz';
      if (lpf4 && moduleStates.lpf4) {
        lpf4.frequency.setValueAtTime(parseFloat(e.target.value), audioContext.currentTime);
      }
    });
    document.getElementById('lpf4Resonance').addEventListener('input', e => {
      document.getElementById('lpf4ResValue').textContent = e.target.value;
      if (lpf4 && moduleStates.lpf4) {
        lpf4.Q.setValueAtTime(parseFloat(e.target.value), audioContext.currentTime);
      }
    });
    document.getElementById('flangerDelay').addEventListener('input', e => {
      document.getElementById('flangerDelayValue').textContent = e.target.value + 's';
      if (flangerDelay) {
        flangerDelay.delayTime.value = parseFloat(e.target.value);
      }
    });
    document.getElementById('flangerDepth').addEventListener('input', e => {
      document.getElementById('flangerDepthValue').textContent = e.target.value;
      if (flangerDepth) {
        flangerDepth.gain.value = parseFloat(e.target.value);
      }
    });
    document.getElementById('flangerRate').addEventListener('input', e => {
      document.getElementById('flangerRateValue').textContent = e.target.value + ' Hz';
      if (flangerLFO) {
        flangerLFO.frequency.value = parseFloat(e.target.value);
      }
    });
    document.getElementById('flangerFeedback').addEventListener('input', e => {
      document.getElementById('flangerFeedbackValue').textContent = e.target.value;
      if (flangerFeedback) {
        flangerFeedback.gain.value = parseFloat(e.target.value);
      }
    });
    document.getElementById('chorusRate').addEventListener('input', e => {
      document.getElementById('chorusRateValue').textContent = e.target.value + ' Hz';
      if (chorusLFO) {
        chorusLFO.frequency.value = parseFloat(e.target.value);
      }
    });
    document.getElementById('chorusDelay').addEventListener('input', e => {
      document.getElementById('chorusDelayValue').textContent = e.target.value + 's';
      if (chorusDelay) {
        chorusDelay.delayTime.value = parseFloat(e.target.value);
      }
    });
    document.getElementById('chorusDepth').addEventListener('input', e => {
      document.getElementById('chorusDepthValue').textContent = e.target.value;
      if (chorusDepth) {
        chorusDepth.gain.value = parseFloat(e.target.value);
      }
    });
    document.getElementById('chorusMix').addEventListener('input', e => {
      document.getElementById('chorusMixValue').textContent = e.target.value + '%';
      if (chorusMix && chorusDry) {
        const mix = parseFloat(e.target.value) / 100;
        chorusMix.gain.value = mix;
        chorusDry.gain.value = 1 - mix;
      }
    });
    function setupOscilloscope() {
      if (!audioContext) return;
      scopeCanvas = document.getElementById('oscilloscope');
      if (!scopeCanvas) return;
      scopeCtx = scopeCanvas.getContext('2d');
      if (!scopeCtx) return;
      if (!analyser) {
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        if (gainNode) {
          gainNode.connect(analyser);
        }
      }
      if (analyser && scopeCanvas && scopeCtx && moduleStates.scope) {
        drawOscilloscope();
      }
    }
    function drawOscilloscope() {
      if (!analyser || !scopeCanvas || !scopeCtx || !moduleStates.scope) {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
          scopeCtx.fillStyle = '#0a0a0a';
          scopeCtx.fillRect(0, 0, scopeCanvas.width, scopeCanvas.height);
        }
        return;
      }
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(dataArray);
      scopeCtx.fillStyle = '#0a0a0a';
      scopeCtx.fillRect(0, 0, scopeCanvas.width, scopeCanvas.height);
      scopeCtx.lineWidth = 2;
      scopeCtx.strokeStyle = '#00ff88';
      scopeCtx.beginPath();
      const sliceWidth = scopeCanvas.width * 1.0 / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * scopeCanvas.height / 2;
        if (i === 0) {
          scopeCtx.moveTo(x, y);
        } else {
          scopeCtx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      scopeCtx.lineTo(scopeCanvas.width, scopeCanvas.height / 2);
      scopeCtx.stroke();
      animationFrame = requestAnimationFrame(drawOscilloscope);
    }
    function createLFO() {
      if (!audioContext) return;
      lfo = audioContext.createOscillator();
      const lfoGain = audioContext.createGain();
      lfo.type = document.getElementById('lfoWaveform').value;
      lfo.frequency.value = parseFloat(document.getElementById('lfoFrequency').value);
      const lfoAmount = parseFloat(document.getElementById('lfoAmount').value) / 100;
      lfoGain.gain.value = 100 * lfoAmount;
      lfo.connect(lfoGain);
      lfoGain.connect(oscillator.frequency);
      lfo.start();
    }
    function initSequencer() {
      const grid = document.getElementById('sequencerGrid');
      grid.innerHTML = '';
      const steps = parseInt(document.getElementById('seqSteps').value);
      for (let i = 0; i < steps; i++) {
        const step = document.createElement('button');
        step.className = 'seq-step';
        step.dataset.step = i;
        step.dataset.freq = baseFrequencies[i % 8];
        step.textContent = `${Math.floor(i / 8) + 1}.${i % 8 + 1}`;
        step.addEventListener('click', () => {
          step.classList.toggle('active');
        });
        grid.appendChild(step);
      }
    }
    function updateSequencer() {
      const bpm = parseInt(document.getElementById('seqBPM').value);
      const stepTime = 60 * 1000 / bpm;
      if (sequencerInterval) {
        clearInterval(sequencerInterval);
      }
      if (isSequencerPlaying) {
        sequencerInterval = setInterval(playNextStep, stepTime);
      }
    }
    function playNextStep() {
      const steps = document.querySelectorAll('.seq-step');
      steps.forEach(step => step.classList.remove('current'));
      const currentStepEl = steps[currentStep];
      currentStepEl.classList.add('current');
      if (currentStepEl.classList.contains('active')) {
        if (oscillator) {
          oscillator.frequency.setValueAtTime(parseFloat(currentStepEl.dataset.freq), audioContext.currentTime);
        }
      }
      currentStep = (currentStep + 1) % steps.length;
    }
    document.getElementById('seqBPM').addEventListener('input', e => {
      document.getElementById('seqBPMValue').textContent = e.target.value;
      updateSequencer();
    });
    document.getElementById('seqSteps').addEventListener('change', initSequencer);
    document.getElementById('seqPlay').addEventListener('click', e => {
      isSequencerPlaying = !isSequencerPlaying;
      e.target.textContent = isSequencerPlaying ? 'Stop Sequence' : 'Play Sequence';
      if (isSequencerPlaying) {
        currentStep = 0;
        updateSequencer();
      } else {
        if (sequencerInterval) {
          clearInterval(sequencerInterval);
        }
        document.querySelectorAll('.seq-step').forEach(step => {
          step.classList.remove('current');
        });
      }
    });
    document.getElementById('seqClear').addEventListener('click', () => {
      document.querySelectorAll('.seq-step').forEach(step => {
        step.classList.remove('active');
      });
    });
    function loadPreset() {
      const modal = document.getElementById('loadChoiceModal');
      modal.classList.add('show');
      const handleLocalStorage = () => {
        const slot = document.getElementById('presetSlot').value;
        const preset = JSON.parse(localStorage.getItem(`synthPreset${slot}`));
        if (!preset) {
          const notification = document.getElementById('loadNotification');
          notification.textContent = `No configuration found in slot ${slot}!`;
          notification.classList.add('show');
          setTimeout(() => notification.classList.remove('show'), 2000);
          return;
        }
        applyPreset(preset);
        const notification = document.getElementById('loadNotification');
        notification.textContent = `Configuration loaded successfully from slot ${slot}!`;
        notification.classList.add('show');
        setTimeout(() => {
          notification.classList.remove('show');
        }, 2000);
        modal.classList.remove('show');
      };
      const handleDevice = () => {
        loadFromJsonFile();
        modal.classList.remove('show');
      };
      document.getElementById('loadLocalStorage').onclick = handleLocalStorage;
      document.getElementById('loadDevice').onclick = handleDevice;
      modal.onclick = e => {
        if (e.target === modal) {
          modal.classList.remove('show');
        }
      };
    }
    function loadFromJsonFile() {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.json';
      fileInput.onchange = function (e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = function (e) {
          try {
            const preset = JSON.parse(e.target.result);
            applyPreset(preset);
            const notification = document.getElementById('loadNotification');
            notification.textContent = 'Configuration loaded successfully from file!';
            notification.classList.add('show');
            setTimeout(() => notification.classList.remove('show'), 2000);
          } catch (error) {
            const notification = document.getElementById('loadNotification');
            notification.textContent = 'Error loading configuration file!';
            notification.classList.add('show');
            setTimeout(() => notification.classList.remove('show'), 2000);
            document.getElementById('loadChoiceModal').classList.remove('show');
          }
        };
        reader.readAsText(file);
      };
      fileInput.click();
    }
    function applyPreset(preset) {
      Object.entries(preset.moduleStates).forEach(([module, state]) => {
        const switchElement = document.querySelector(`.module-switch[data-module="${module}"]`);
        if (switchElement) {
          switchElement.checked = state;
          moduleStates[module] = state;
        }
      });
      const elements = {
        'frequency': ['value', 'freqValue', ' Hz'],
        'waveform': ['value'],
        'cutoff': ['value', 'cutoffValue', ' Hz'],
        'resonance': ['value', 'resValue', ''],
        'attack': ['value', 'attackValue', 's'],
        'release': ['value', 'releaseValue', 's'],
        'lfoFreq': ['value', 'lfoFreqValue', ' Hz'],
        'lfoAmount': ['value', 'lfoAmountValue', '%'],
        'lfoWaveform': ['value'],
        'reverbMix': ['value', 'reverbMix1Value', '%'],
        'reverbDecay': ['value', 'reverbDecay1Value', 's'],
        'echoTime': ['value', 'echoTimeValue', 's'],
        'echoFeedback': ['value', 'echoFeedbackValue', '%'],
        'echoMix': ['value', 'echoMixValue', '%'],
        'distDrive': ['value', 'distDriveValue', ''],
        'distMix': ['value', 'distMixValue', '%'],
        'lpf2Cutoff': ['value', 'lpf2CutoffValue', ' Hz'],
        'lpf2Resonance': ['value', 'lpf2ResValue', ''],
        'lpf4Cutoff': ['value', 'lpf4CutoffValue', ' Hz'],
        'lpf4Resonance': ['value', 'lpf4ResValue', '']
      };
      Object.entries(elements).forEach(([id, [prop, labelId, unit = '']]) => {
        const element = document.getElementById(id);
        if (element && preset[id]) {
          element[prop] = preset[id];
          if (labelId) {
            const label = document.getElementById(labelId);
            if (label) {
              label.textContent = preset[id] + unit;
            }
          }
        }
      });
      if (preset.seqBPM) {
        document.getElementById('seqBPM').value = preset.seqBPM;
        document.getElementById('seqBPMValue').textContent = preset.seqBPM;
      }
      if (preset.numberOfSteps) {
        document.getElementById('seqSteps').value = preset.numberOfSteps;
        initSequencer();
      }
      if (preset.seqSteps) {
        const steps = document.querySelectorAll('.seq-step');
        preset.seqSteps.forEach((isActive, index) => {
          if (isActive && steps[index]) {
            steps[index].classList.add('active');
          }
        });
      }
      if (isPlaying) {
        oscillator.stop();
        if (lfo) lfo.stop();
        setupAudio();
        createOscillator();
        oscillator.start();
      }
    }
    function savePreset() {
      const slot = document.getElementById('presetSlot').value;
      const preset = {
        moduleStates,
        frequency: document.getElementById('frequency').value,
        waveform: document.getElementById('waveform').value,
        cutoff: document.getElementById('cutoff').value,
        resonance: document.getElementById('resonance').value,
        attack: document.getElementById('attack').value,
        release: document.getElementById('release').value,
        lfoFreq: document.getElementById('lfoFrequency').value,
        lfoAmount: document.getElementById('lfoAmount').value,
        lfoWaveform: document.getElementById('lfoWaveform').value,
        reverbMix: document.getElementById('reverbMix1').value,
        reverbDecay: document.getElementById('reverbDecay1').value,
        echoTime: document.getElementById('echoTime').value,
        echoFeedback: document.getElementById('echoFeedback').value,
        echoMix: document.getElementById('echoMix').value,
        distDrive: document.getElementById('distDrive').value,
        distMix: document.getElementById('distMix').value,
        lpf2Cutoff: document.getElementById('lpf2Cutoff').value,
        lpf2Resonance: document.getElementById('lpf2Resonance').value,
        lpf4Cutoff: document.getElementById('lpf4Cutoff').value,
        lpf4Resonance: document.getElementById('lpf4Resonance').value
      };
      preset.flangerDelay = document.getElementById('flangerDelay').value;
      preset.flangerDepth = document.getElementById('flangerDepth').value;
      preset.flangerRate = document.getElementById('flangerRate').value;
      preset.flangerFeedback = document.getElementById('flangerFeedback').value;
      preset.chorusRate = document.getElementById('chorusRate').value;
      preset.chorusDelay = document.getElementById('chorusDelay').value;
      preset.chorusDepth = document.getElementById('chorusDepth').value;
      preset.chorusMix = document.getElementById('chorusMix').value;
      const sequencerSteps = Array.from(document.querySelectorAll('.seq-step')).map(step => step.classList.contains('active'));
      preset.seqSteps = sequencerSteps;
      preset.seqBPM = document.getElementById('seqBPM').value;
      preset.numberOfSteps = document.getElementById('seqSteps').value;
      localStorage.setItem(`synthPreset${slot}`, JSON.stringify(preset));
      const notification = document.getElementById('saveNotification');
      notification.textContent = `Configuration saved successfully to slot ${slot}!`;
      notification.classList.add('show');
      setTimeout(() => {
        notification.classList.remove('show');
      }, 2000);
    }
    function downloadConfig() {
      const modal = document.getElementById('downloadChoiceModal');
      modal.classList.add('show');
      const handleConfigDownload = () => {
        const slot = document.getElementById('presetSlot').value;
        const preset = localStorage.getItem(`synthPreset${slot}`);
        if (!preset) {
          const notification = document.getElementById('loadNotification');
          notification.textContent = `No configuration found in slot ${slot}!`;
          notification.classList.add('show');
          setTimeout(() => notification.classList.remove('show'), 2000);
          return;
        }
        const presetObj = JSON.parse(preset);
        const formattedJson = JSON.stringify(presetObj, null, 2);
        const blob = new Blob([formattedJson], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `synth-preset-${slot}.json`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
        const notification = document.getElementById('saveNotification');
        notification.textContent = `Configuration downloaded from slot ${slot}!`;
        notification.classList.add('show');
        setTimeout(() => notification.classList.remove('show'), 2000);
        modal.classList.remove('show');
      };
      const handleAudioDownload = () => {
        if (!audioContext) {
          initAudio();
        }
        const notification = document.getElementById('audioNotification');
        notification.classList.add('show');
        if (!isPlaying) {
          playButton.click();
        }
        recordAudio(10).catch(error => {
          notification.classList.remove('show');
          const errorNotification = document.getElementById('saveNotification');
          errorNotification.textContent = 'Error recording audio: ' + error.message;
          errorNotification.classList.add('show');
          setTimeout(() => errorNotification.classList.remove('show'), 2000);
        });
        modal.classList.remove('show');
      };
      document.getElementById('downloadConfig').onclick = handleConfigDownload;
      document.getElementById('downloadAudio').onclick = handleAudioDownload;
      modal.onclick = e => {
        if (e.target === modal) {
          modal.classList.remove('show');
        }
      };
    }
    async function recordAudio(duration) {
      try {
        if (!audioContext) {
          initAudio();
        }
        if (!audioContext || !gainNode) {
          throw new Error('Audio system not initialized');
        }
        const mediaStreamDestination = audioContext.createMediaStreamDestination();
        gainNode.connect(mediaStreamDestination);
        const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream);
        const audioChunks = [];
        return new Promise((resolve, reject) => {
          mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
          };
          mediaRecorder.onstop = async () => {
            try {
              const audioBlob = new Blob(audioChunks, {
                type: 'audio/mp3'
              });
              const url = URL.createObjectURL(audioBlob);
              const downloadLink = document.createElement('a');
              downloadLink.href = url;
              const slot = document.getElementById('presetSlot').value;
              downloadLink.download = `synth-audio-${slot}.mp3`;
              document.body.appendChild(downloadLink);
              downloadLink.click();
              document.body.removeChild(downloadLink);
              URL.revokeObjectURL(url);
              if (isPlaying) {
                playButton.click();
              }
              const notification = document.getElementById('saveNotification');
              notification.textContent = `Audio downloaded from slot ${slot}!`;
              notification.classList.add('show');
              setTimeout(() => {
                notification.classList.remove('show');
              }, 2000);
              resolve();
            } catch (error) {
              reject(error);
            }
          };
          const wasPlaying = isPlaying;
          const notification = document.getElementById('audioNotification');
          notification.classList.add('show');
          if (!isPlaying) {
            playButton.click();
          }
          mediaRecorder.start();
          setTimeout(() => {
            mediaRecorder.stop();
            notification.classList.remove('show');
            gainNode.disconnect(mediaStreamDestination);
            if (isPlaying) {
              playButton.click();
            }
          }, duration * 1000);
        });
      } catch (error) {
        const notification = document.getElementById('saveNotification');
        notification.textContent = 'Unable to record audio - ' + error.message;
        notification.classList.add('show');
        setTimeout(() => notification.classList.remove('show'), 2000);
        throw error;
      }
    }
    document.querySelector('.preset-save').addEventListener('click', savePreset);
    document.querySelector('.preset-load').addEventListener('click', loadPreset);
    document.querySelector('.preset-download').addEventListener('click', downloadConfig);
    initSequencer();
    const mainMenu = document.getElementById('mainMenu');
    const startButton = document.getElementById('startButton');
    const instructionsButton = document.getElementById('instructionsButton');
    const instructionsModal = document.getElementById('instructionsModal');
    const closeInstructions = document.getElementById('closeInstructions');
    const synthContainer = document.querySelector('.synth-container');
    synthContainer.classList.add('hidden');
    startButton.addEventListener('click', () => {
      mainMenu.style.display = 'none';
      synthContainer.classList.remove('hidden');
    });
    instructionsButton.addEventListener('click', () => {
      instructionsModal.classList.add('show');
      synthContainer.classList.add('blur');
      mainMenu.classList.add('blur');
    });
    closeInstructions.addEventListener('click', () => {
      instructionsModal.classList.remove('show');
      synthContainer.classList.remove('blur');
      mainMenu.classList.remove('blur');
    });
    window.addEventListener('click', e => {
      if (e.target === instructionsModal) {
        instructionsModal.classList.remove('show');
        synthContainer.classList.remove('blur');
        mainMenu.classList.remove('blur');
      }
    });