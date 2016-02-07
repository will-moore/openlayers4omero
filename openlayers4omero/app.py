from omero.gateway import BlitzGateway
from omeroweb.webgateway.marshal import shapeMarshal
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
    
    def convertDictToArray(self, dic):
        if dic is None or type(dic) is not dict:
            return None
        ret = None
        try:
            return map(lambda x: 1 / x, sorted(dic.values()))
        except Exception as ex:
            print ex
            ret = None
 
        return ret
    
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
                                   ,"sizeC" : image.getSizeC()
                                   ,"zoomLevelScaling" : self.convertDictToArray(image.getZoomLevelScaling())
                                   ,"isGreyScale" : image.isGreyscaleRenderingModel()
                                   , "channelLabels" : image.getChannelLabels()
                                   ,"roiCount" : image.getROICount(), "requiresPixelsPyramid" : image.requiresPixelsPyramid()
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

    def get_rois(self, imageId):
        if self._connection is None or not self._connection.isConnected():
            if not self.connect(): return None

        try:
            rois = []
            roiService = self._connection.getRoiService()
            result = roiService.findByImage(long(imageId), None, self._connection.SERVICE_OPTS)
        
            for r in result.rois:
                roi = {}
                roi['id'] = r.getId().getValue()
                # go through all the shapes of the ROI
                shapes = []
                for s in r.copyShapes():
                    if s is None:   # seems possible in some situations
                        continue
                    shapes.append(shapeMarshal(s))
                # sort shapes by Z, then T.
                shapes.sort(
                    key=lambda x: "%03d%03d"
                    % (x.get('theZ', -1), x.get('theT', -1)))
                roi['shapes'] = shapes
                rois.append(roi)
        
            rois.sort(key=lambda x: x['id'])
        
            return rois
        except Exception as e:
            print e
            return None

    def equals(self, one_float, second_float, tolerance = 0.00000001):
        if type(one_float) is not float or type(second_float) is not float:
            return False
        diff = abs(one_float-second_float)
        if diff > tolerance:
            return False
        return True

    def getThumbnail(self, imageid):
        img = self.getImage0(imageid)
        if img is None:
            return None
        
        try:
            return img.getThumbnail()
        except Exception as e:
            print e
            return None

    def getImage(self, imageid, z=0, t=0, c=0, tile=None, l=None):
        img = self.getImage0(imageid)
        if img is None:
            return None
        
        try:
            c = int(c)
            if c > 0:
                img.setActiveChannels([c])
            if tile is None: 
                return img.renderJpeg(z, t)

            res = img.getZoomLevelScaling()
            
            if res is None:
                l = None
            else:
                levels = len(res) - 1
                if l is not None:
                    if levels > 0:
                        l = int(l)
                        if l < 0 or l > levels:
                            print 'resolution level out of range'
                    l=levels-l

            offX = int(tile['x']) * int(tile['w'])
            offY = int(tile['y']) * int(tile['h'])
   
            return img.renderJpegRegion(z, t, offX, offY, tile['w'],tile['h'], l);
        except Exception as e:
            print e
            return None