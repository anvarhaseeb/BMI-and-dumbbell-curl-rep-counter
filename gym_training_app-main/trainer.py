import cv2
import mediapipe as mp
import numpy as np
from enum import Enum
from typing import Optional, Tuple
# pose documentation
# https://google.github.io/mediapipe/solutions/pose.html


class DumbellState(Enum):
    Inactive = 0
    Down = 1
    Up = 2


def get_dmbl_rep(shoulder, elbow, wrist, dumbl_state, dmbl_count, up_threshold=30, down_threshold=130):
    # Convert list of each pair [x,y] to numpy array
    shoulder_np, wrist_np, elbow_np = list(
        map(lambda x: np.array(x), [shoulder, wrist, elbow]))
    # Calculate angle btw wrist,elbow  & angle btw shoulder,elbow
    ang_wrist_elbow, ang_shoulder_elbow = list(map(
        lambda x, y: np.arctan2(
            x[1]-y[1], x[0]-y[0]), [wrist_np, shoulder_np], [elbow_np, elbow_np]
    ))
    # angle in radians
    req_angle = ang_wrist_elbow-ang_shoulder_elbow
    # angle in degrees
    # deg(rad_ang)=|rad_ang*180/pi|
    req_angle = np.abs(req_angle*180/np.pi)

    if req_angle > down_threshold:
        return DumbellState.Down, dmbl_count, req_angle

    if (req_angle < up_threshold and dumbl_state == DumbellState.Down):
        return DumbellState.Up, dmbl_count+1, req_angle

    return dumbl_state, dmbl_count, req_angle


class Trainer():
    def __init__(self):
        self.mp_pose = mp.solutions.pose
        self.cap = cv2.VideoCapture(0)
        # Dumbell workout
        # Counter
        self.lf_dmbl_count = 0
        self.rt_dmbl_count = 0
        # State
        self.lf_dmbl_state = DumbellState.Inactive
        self.rt_dmbl_state = DumbellState.Inactive
        # Angle
        self.lf_dmbl_angle = 0
        self.rt_dmbl_angle = 0

    def get_frame(self) -> Optional[Tuple[int, int, bytes]]:
        with self.mp_pose.Pose() as pose:
            while self.cap.isOpened():
                ret, img = self.cap.read()
                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                img.flags.writeable = False
                res = pose.process(img)
                img.flags.writeable = True
                img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
                try:
                    lm_val = self.mp_pose.PoseLandmark
                    landmarks = res.pose_landmarks.landmark
                    # dumbell workout rep
                    try:
                        # Left Hand
                        [lf_shoulder, lf_elbow, lf_wrist] = list(map(lambda lm: [lm.x, lm.y], [landmarks[lm_val.LEFT_SHOULDER.value],
                                                                                               landmarks[lm_val.LEFT_ELBOW.value],
                                                                                               landmarks[lm_val.LEFT_WRIST.value]]))

                        self.lf_dmbl_state, self.lf_dmbl_count, self.lf_dmbl_angle = get_dmbl_rep(
                            lf_shoulder, lf_elbow, lf_wrist, self.lf_dmbl_state, self.lf_dmbl_count)
                    except Exception as err:
                        # print("Error detecting Left Hand \n", err)
                        pass
                    try:
                        # Right Hand
                        [rt_shoulder, rt_elbow, rt_wrist] = list(map(lambda lm: [lm.x, lm.y], [landmarks[lm_val.RIGHT_SHOULDER.value],
                                                                                               landmarks[lm_val.RIGHT_ELBOW.value],
                                                                                               landmarks[lm_val.RIGHT_WRIST.value]]))

                        self.rt_dmbl_state, self.rt_dmbl_count, self.rt_dmbl_angle = get_dmbl_rep(
                            rt_shoulder, rt_elbow, rt_wrist, self.rt_dmbl_state, self.rt_dmbl_count)
                    except Exception as err:
                        # print("Error detecting Right Hand \n", err)
                        pass

                    # Write Left Count
                    img = cv2.putText(img, f"Left : {self.lf_dmbl_count},[{int(self.lf_dmbl_angle)}]", (350, 60),
                                      cv2.FONT_HERSHEY_TRIPLEX, 1, (0, 255, 0), 1, cv2.LINE_AA)
                    # Write Right Count
                    img = cv2.putText(img, f"Right : {self.rt_dmbl_count},[{int(self.rt_dmbl_angle)}]", (10, 60),
                                      cv2.FONT_HERSHEY_TRIPLEX, 1, (0, 255, 0), 1, cv2.LINE_AA)
                    # encode as jpeg
                    _, img = cv2.imencode('.jpg', img)
                    return self.lf_dmbl_count, self.rt_dmbl_count, img.tobytes()
                except Exception as err:
                    # print("Error : ", err)
                    pass
            return None

    def __del__(self):
        self.cap.release()
