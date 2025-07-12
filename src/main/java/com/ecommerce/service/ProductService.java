package com.ecommerce.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ecommerce.entity.Product;
import com.ecommerce.repository.ProductRepo;

@Service
public class ProductService {

    @Autowired
    ProductRepo productRepo;

    //save
    public Product SaveProduct(Product prod){

        return productRepo.save(prod);
    }

    //update
    public void updateProduct(String id,Product product){

        Product oldProduct = productRepo.findById(id).get();

        oldProduct.setName(product.getName());
        oldProduct.setPrice(product.getPrice());
        oldProduct.setRating(product.getRating());
        oldProduct.setCategory(product.getCategory());
        oldProduct.setDescription(product.getDescription());
        oldProduct.setImageId(product.getImageId());

        productRepo.save(oldProduct);
    }

    //delete
    public boolean deleteProduct(String id) {
        if (productRepo.existsById(id)) {
            try {
                productRepo.deleteById(id);
                return !productRepo.existsById(id);
                
            } catch (org.springframework.dao.DataIntegrityViolationException e) {
                return false;
            }
        }
        return false;
    }
 
    //Get
    public List<Product> getAllProduct(){

        return productRepo.findAll();
    }

    //Get by ID
    public Product getById(String id){

        return productRepo.findById(id).get();
    }
}
