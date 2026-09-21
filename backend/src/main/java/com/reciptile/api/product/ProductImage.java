package com.reciptile.api.product;

public class ProductImage {

    private String key;
    private String url;
    private String alt;

    public ProductImage() {
    }

    public ProductImage(String key, String url, String alt) {
        this.key = key;
        this.url = url;
        this.alt = alt;
    }

    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public String getAlt() { return alt; }
    public void setAlt(String alt) { this.alt = alt; }
}
