MAX_CHAT_LOG = 50


class Chat():
    def __init__(self):
        self.logs = []

    def add_msg(self, msg):
        self.logs.append(msg)
        self.logs = self.logs[-MAX_CHAT_LOG:]

    # TODO:
    # catch INT/TERM or atexit -> persist logs
    # boot -> load logs
