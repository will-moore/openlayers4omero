from omero.gateway import BlitzGateway

class App:
    _connection = None
    _request = None
    
    def __init__(self, request = None):
        if request is not None and request.session is not None:
            self._request = request
    
    def connect(self):
        try:
            if self._connection is None:
                self._connection = BlitzGateway('root', 'admin', host='localhost', port=4064)
            
            if self._request is not None and self._request.session is not None and self._request.session.get('sessionId') is not None:
                if self._connection is not None and not self._connection.connect(sUuid=self._request.session['sessionId']):
                    if not self._connection.isConnected() and not self._connection.connect():
                        return False
            else:
                if self._connection is not None and not self._connection.connect():
                    return False  
        except:
            self._connection = None
            return False
        
        if self._request is not None and self._request.session is not None and self._request.session.get('sessionId') is None:
            self._request.session['sessionId'] = self._connection._getSessionId()

        return True
    
    def isConnected(self):
        if self._request is not None and self._request.session is not None and self._request.session.get('sessionId') is not None:
            if self.connect(): return True
        return False
    
    def disconnect(self):
        if self._request is not None and self._request.session is not None and self._request.session.get('sessionId') is not None:
            if self.connect():
                self._connection._closeSession()
        
        self._connection = None
        self._request.session['sessionId'] = None
    
    def listDatasets(self):
        if self._connection is None or not self._connection.isConnected():
            if not self.connect(): return { "error" : "Not Connected"}
        
        datasets = self._connection.getObjects('Dataset')
        ret = []
        for dataset in datasets:
            tmp_images = []
            for image in dataset.listChildren():
                tmp_images.append(
                                  { "name" : image.getName(), "id" : image.getId()
                                   ,"sizeX" : image.getSizeX(), "sizeY" : image.getSizeY()
                                   ,"sizeZ" : image.getSizeZ(), "sizeT" : image.getSizeT()
                                   ,"sizeC" : image.getSizeC(), "zoomLevelScaling" : image.getZoomLevelScaling()
                                   ,"isGreyScale" : image.isGreyscaleRenderingModel(), "roiCount" : image.getROICount()
                                   })
            if tmp_images:
                ret.append({"name" : dataset.getName(), "id" : dataset.getId(), "images" : tmp_images })
                
        if not ret:
            return {'datasets' : []}
        
        return {"datasets": ret}
    
    def getImage0(self, imageid):
        if self._connection is None or not self._connection.isConnected():
            if not self.connect(): return None
            
        try:
            img = self._connection.getObject("Image", imageid)
            return img
        except Exception as e:
            print e
            return None

    def getThumbnail(self, imageid):
        img = self.getImage0(imageid)
        if img is None:
            return None
        
        try:
            return img.getThumbnail()
        except Exception as e:
            print e
            return None

    def getImage(self, imageid, z=0, t=0, tile=None, l=None):
        img = self.getImage0(imageid)
        if img is None:
            return None
        
        if l is not None:
            l = float(l)

        #TODO: check if pyramid and if resolution supported
                
        try:
            if tile is None and l is None: 
                return img.renderJpeg(z, t)
            return img.renderJpegRegion(z, t, tile['x'], tile['y'], tile['w'],tile['h'], l)
        except Exception as e:
            print e
            return None