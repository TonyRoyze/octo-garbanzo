package com.reciptile.api.controller;

import com.reciptile.api.service.UploadThingService;
import com.reciptile.api.upload.PrepareImageUploadRequest;
import com.reciptile.api.upload.PreparedImageUpload;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/uploads")
public class UploadController {

    private final UploadThingService uploadThing;

    public UploadController(UploadThingService uploadThing) {
        this.uploadThing = uploadThing;
    }

    @PostMapping("/product-images/prepare")
    public PreparedImageUpload prepareProductImage(@Valid @RequestBody PrepareImageUploadRequest request) {
        return uploadThing.prepareProductImage(request);
    }
}
