import { Component, OnInit } from '@angular/core';
import { NativeAudio } from '@capacitor-community/native-audio';
import { SpeechRecognition, AudioSessionCategory as  AudioSessionCategorySpeechRedcognition } from '@capawesome-team/capacitor-speech-recognition';
import { SpeechSynthesis, QueueStrategy, AudioSessionCategory } from '@capawesome-team/capacitor-speech-synthesis';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
    standalone: false,
})
export class HomePage implements OnInit {

    constructor() { }

    async ngOnInit(): Promise<void> {}


    async checkPermissions() {
        const { speechRecognition, audioRecording } = await SpeechRecognition.checkPermissions();

        console.log("RET", speechRecognition, audioRecording);

        if (speechRecognition !== 'granted' || audioRecording !== 'granted') {
            await SpeechRecognition.requestPermissions({
                permissions: ['audioRecording', 'speechRecognition'],
            });
        }
    }

    async music() {
        await NativeAudio.preload({
            assetId: 'bg',
            assetPath: 'public/assets/sounds/test.mp3',
            audioChannelNum: 1,
            isUrl: false,
            volume: 0.6
        });

        await NativeAudio.loop({ assetId: 'bg' });

    }

    recognize(): void {
        this.startListening((data) => {
            alert("Sentence: " + data);
        });
    }

    async startListening(cb: (data: string) => void) {
        await this.checkPermissions();


        const { audioRecording, speechRecognition } = await SpeechRecognition.requestPermissions({
            permissions: ['audioRecording', 'speechRecognition'],
        });

        //    const langs =  await SpeechRecognition.getLanguages();
        console.log("audioRecording, speechRecognitio", audioRecording, speechRecognition)
        //  console.log("LANGS", langs);

        console.log("🎙️ Spracherkennung wird gestartet...");

        SpeechRecognition.startListening({
            language: "de-DE",
            audioSessionCategory: AudioSessionCategorySpeechRedcognition.PlayAndRecord,
            deactivateAudioSessionOnStop: false,
            silenceThreshold: 800
        });

        SpeechRecognition.addListener("result", async (event) => {
            console.log("EVENT RESULT", event);

            if (event.result) {
                const finalSentence = event.result;

                await this.destroyRecognition();
                cb(finalSentence);
            }
        });

        // 🎧 Listener für Fehler
        SpeechRecognition.addListener("error", (event) => {
            console.error("❌ Spracherkennungsfehler:", event.message);
        });
    }

    async destroyRecognition(): Promise<void> {
        await SpeechRecognition.stopListening({deactivateAudioSession: false});
        await SpeechRecognition.removeAllListeners();
    }

    async activateAudioSession() {
        await SpeechSynthesis.activateAudioSession({ category: AudioSessionCategory.Ambient });
    }

    async speak() {
        await SpeechSynthesis.initialize();
        const { utteranceId } = await SpeechSynthesis.speak({
            language: 'en-US',
            pitch: 1.0,
            queueStrategy: QueueStrategy.Add,
            rate: 1.0,
            text: 'Hello, World!',
            voiceId: 'com.apple.ttsbundle.Samantha-compact',
            volume: 1.0,
        });
    }
}
