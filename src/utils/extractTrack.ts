function extractTrack(stream: MediaStream) {
    const tracks = stream.getTracks();

    if (tracks.length !== 1) {
        throw new TypeError('UnknownError: an unknown error occurred');
    }

    return tracks[0];
}

export default extractTrack;
