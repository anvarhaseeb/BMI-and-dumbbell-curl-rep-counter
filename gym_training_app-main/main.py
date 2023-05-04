from flask import Flask, Response
from trainer import Trainer

app = Flask(__name__)


def start_feed(tr: Trainer):
    while True:
        res = tr.get_frame()
        if res:
            lf_cnt, rt_cnt, frame = res
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')


@app.route('/trainer_feed')
def video_feed():
    return Response(start_feed(Trainer()),
                    mimetype='multipart/x-mixed-replace; boundary=frame')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, threaded=True, debug=True)
