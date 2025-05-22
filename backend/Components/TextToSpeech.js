import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


class TextToSpeech {

    constructor(speechRecievedCallback = this.defaultCallback) {
        this.speechRecievedCallback = speechRecievedCallback;
        console.log("Text To Speech starting");
         this.py = spawn('python3', ['scriptTTS.py'], {
            cwd: path.join(__dirname, '../../python') // Correct relative path
        });

        // Listen for any message from Python
         this.py.stdout.on('data', (data) => {
            data.toString().split('\n').filter(Boolean).forEach(line => {
                let msg;
                try {
                    msg = JSON.parse(line);
                } catch (e) {
                    console.error('Failed to parse Python message (non-JSON):', line);
                    return;
                }
                try {
                   this.speechRecievedCallback(msg);
                } catch (e) {
                    console.error('Error handling Python message:', msg, e);
                }
            });
        });

        // Optional: Handle Python errors and exit
         this.py.stderr.on('data', (data) => {
            console.error('Python:', data.toString());
        });
         this.py.on('close', (code) => {
            console.log(`Python process exited with code ${code}`);
        });
    }

    say(TTStext, voice = 0) {
         this.py.stdin.write(JSON.stringify({
            text: TTStext,
            model: voice
        }) + "\n");
    }

    pause() {
        py.stdin.write(JSON.stringify({ command: "pause" }) + "\n");
    }
    resume() {
        py.stdin.write(JSON.stringify({ command: "resume" }) + "\n");
    }

   defaultCallback(data) {
        console.log("default callback function: " + data);
    }

}
export default TextToSpeech;