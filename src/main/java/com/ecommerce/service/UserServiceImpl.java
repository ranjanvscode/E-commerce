package com.ecommerce.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ecommerce.ServiceInterface.UserService;
import com.ecommerce.entity.User;
import com.ecommerce.helper.AppConstant;
import com.ecommerce.helper.ResourceNotFound;
import com.ecommerce.repository.UserRepository;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public User saveUser(User user) {

        String userId = UUID.randomUUID().toString();
        User userExist = userRepo.findByEmail(user.getEmail()).orElse(null);

        if(userExist==null){
            
            user.setId(userId);
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            
            if(user.getEmail().equals("ranjan@gmail.com")){

                user.setRoleList(List.of(AppConstant.ROLE_USER,AppConstant.ROLE_ADMIN));
            }else{
                
                user.setRoleList(List.of(AppConstant.ROLE_USER));
            }
            
            return userRepo.save(user);
        }else{
            return null;
        }
        
    }

    @Override
    public Optional<User> getUserById(String id) {
        return userRepo.findById(id);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepo.findAll();
    } 

    @Override
    public User updateUser(User user) {

        return userRepo.save(user);
    }

    @Override
    public void deleteUser(User user) {
        User user2 = userRepo.findById(user.getId()).orElseThrow(()-> new ResourceNotFound("user not found"));
        userRepo.delete(user2);
    }

    @Override
    public boolean isUserExistById(String id) {
        User user2 = userRepo.findById(id).orElse(null);
        return user2 != null;
    }

    @Override
    public boolean isUserExistByEmail(String email) {
        User user2 = userRepo.findByEmail(email).orElse(null);
        return user2 != null;
    }


    @Override
    public Optional<User> getUserByEmailAndPassword(String email,String password)
    {
        User user2 = userRepo.findByEmailAndPassword(email,password).orElse(null);
        return Optional.ofNullable(user2);
    }

    @Override
    public User getUserByEmail(String email) {

        Optional<User> user;
        
        user = userRepo.findByEmail(email);

        return user.orElse(null);
    }
}

