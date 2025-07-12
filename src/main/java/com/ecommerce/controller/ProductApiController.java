package com.ecommerce.controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.ServiceInterface.ImageService;
import com.ecommerce.dto.ProductRequest;
import com.ecommerce.dto.ProductResponse;
import com.ecommerce.entity.Category;
import com.ecommerce.entity.Product;
import com.ecommerce.service.CategoryService;
import com.ecommerce.service.DiscountService;
import com.ecommerce.service.ProductService;

import jakarta.validation.Valid;


@RestController
@RequestMapping("/products")
public class ProductApiController {

    private final ProductService productService;
    private final DiscountService discountService;
    private final CategoryService categoryService;
    private final ImageService imageService;

    public ProductApiController(ProductService productService, 
                                DiscountService discountService, 
                                CategoryService categoryService, 
                                ImageService imageService) {

        this.productService = productService;
        this.discountService = discountService;
        this.categoryService = categoryService;
        this.imageService = imageService;
    }

    @GetMapping("/getAllProduct")
    public List<ProductResponse> getAllProducts() {
        return productService.getAllProduct().stream()
            .map(p -> {
                BigDecimal finalPrice = discountService.getFinalPrice(p);

                p.setDiscount(((p.getPrice().subtract(finalPrice)).multiply(BigDecimal.valueOf(100))).divide(p.getPrice()));

                return new ProductResponse(p.getId(), p.getName(), p.getPrice(), 
                                            finalPrice, p.getDiscount(), p.getImageId(), 
                                            p.getCloudinaryImagePublicId(), p.isInStock(), 
                                            p.getCategory().getCategoryName(), p.getRating(), 
                                            p.getDescription());
            })
            .toList();
    }

 
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/save")
    public ResponseEntity<String> saveProduct(@Valid @ModelAttribute ProductRequest product, BindingResult result) {

        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body("Something is wrong in form");
        }

        Category category = new Category();
        Category existingCategory = categoryService.getByName(product.getCategory()).orElse(null);
        
        Product product2 = new Product();

        if (existingCategory!=null) {
            product2.setCategory(existingCategory);
        }else{
            category.setCategoryName(product.getCategory());
            product2.setCategory(categoryService.saveCategory(category));
        }


        product2.setId(UUID.randomUUID().toString());
        product2.setName(product.getName());
        product2.setPrice(product.getPrice());
        product2.setDiscount(product.getDiscount());
        product2.setInStock(product.getInStock().equals("yes"));
        product2.setDescription(product.getDescription());
        product2.setRating(product.getRating()!=null?product.getRating():0);    

        //Saving images in cloudinary
        if (product.getImage()!=null && !product.getImage().isEmpty()) {

            String fileName = UUID.randomUUID().toString();// Cloudinary image Public Id
            String fileUrl = imageService.uploadimage(product.getImage(),fileName);
            product2.setImageId(fileUrl);
            product2.setCloudinaryImagePublicId(fileName);
        }
       
        productService.SaveProduct(product2);
        
        return ResponseEntity.ok("Product saved successfully");
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteProduct(@RequestBody Map<String, String> payload) { 
        String productId = payload.get("id");
        String imageId = payload.get("imageId");

        if (imageId != null) {
            imageService.deleteImage(imageId);
        }
        
        boolean deleted = productService.deleteProduct(productId);
        if (!deleted) {
            return ResponseEntity.status(404).body("Product not found or failed to delete");
        }

        return ResponseEntity.ok("Product deleted successfully");
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/updateProduct/{productId}")
    public void updateProduct(@ModelAttribute ProductRequest newProduct, @PathVariable("productId") String productId) {
        
        Product oldProduct = productService.getById(productId);

        //Set category in product
        if (newProduct.getCategory() != null && !newProduct.getCategory().equals(oldProduct.getCategory().getCategoryName())) {
            
                Category existingCategory = categoryService.getByName(newProduct.getCategory()).orElse(null);

                if (existingCategory!=null) {
                    oldProduct.setCategory(existingCategory);
                }else{

                    Category category = new Category();
                    category.setCategoryName(newProduct.getCategory());
                    oldProduct.setCategory(categoryService.saveCategory(category));
                }
        }

        // If new image is provided, delete old image from cloudinary and upload new image
        if (newProduct.getImage()!=null && !newProduct.getImage().isEmpty()) {

            String publicId = oldProduct.getCloudinaryImagePublicId();
            if(publicId!=null) imageService.deleteImage(publicId);
            
            String fileName = UUID.randomUUID().toString();// Cloudinary image Public Id
            String fileUrl = imageService.uploadimage(newProduct.getImage(),fileName);
            oldProduct.setImageId(fileUrl);
            oldProduct.setCloudinaryImagePublicId(fileName);
        }

        oldProduct.setName(newProduct.getName());
        oldProduct.setPrice(newProduct.getPrice());
        oldProduct.setDiscount(newProduct.getDiscount());
        oldProduct.setInStock("yes".equalsIgnoreCase(newProduct.getInStock()));
        oldProduct.setRating(newProduct.getRating()!=null?newProduct.getRating():0);
        oldProduct.setDescription(newProduct.getDescription());

        productService.SaveProduct(oldProduct);
    }
    
}

