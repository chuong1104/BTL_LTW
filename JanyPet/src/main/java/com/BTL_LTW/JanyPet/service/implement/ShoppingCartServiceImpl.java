package com.BTL_LTW.JanyPet.service.implement;

import com.BTL_LTW.JanyPet.dto.request.CartDetailCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.CartDetailUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.CartDetailResponse;
import com.BTL_LTW.JanyPet.dto.response.ShoppingCartResponse;
import com.BTL_LTW.JanyPet.entity.CartDetail;
import com.BTL_LTW.JanyPet.entity.Product;
import com.BTL_LTW.JanyPet.entity.ShoppingCart;
import com.BTL_LTW.JanyPet.entity.User;
import com.BTL_LTW.JanyPet.repository.CartDetailRepository;
import com.BTL_LTW.JanyPet.repository.ProductRepository;
import com.BTL_LTW.JanyPet.repository.ShoppingCartRepository;
import com.BTL_LTW.JanyPet.repository.UserRepository;
import com.BTL_LTW.JanyPet.service.Interface.InventoryService;
import com.BTL_LTW.JanyPet.service.Interface.ShoppingCartService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ShoppingCartServiceImpl implements ShoppingCartService {

    @Autowired
    private ShoppingCartRepository shoppingCartRepository;

    @Autowired
    private CartDetailRepository cartDetailRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InventoryService inventoryService;

    @Override
    @Transactional
    public ShoppingCartResponse getShoppingCart(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        ShoppingCart cart = shoppingCartRepository.findByUser(user)
                .orElseGet(() -> {
                    ShoppingCart newCart = new ShoppingCart();
                    newCart.setUser(user);
                    return shoppingCartRepository.save(newCart);
                });
        return mapToShoppingCartResponse(cart);
    }

    @Override
    @Transactional
    public ShoppingCartResponse addCartDetail(String userId, CartDetailCreationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        ShoppingCart cart = shoppingCartRepository.findByUser(user)
                .orElseGet(() -> {
                    ShoppingCart newCart = new ShoppingCart();
                    newCart.setUser(user);
                    return shoppingCartRepository.save(newCart);
                });

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product không tồn tại"));
        
        int currentStock = inventoryService.calculateTotalStock(product.getId());
        product.setStock(currentStock);

        if (product.getStock() < request.getQuantity()) {
            throw new RuntimeException("Sản phẩm không đủ số lượng");
        }

        CartDetail cartDetail = new CartDetail();
        cartDetail.setProduct(product);
        cartDetail.setQuantity(request.getQuantity());
        cartDetail.setUnitPrice(product.getPrice());
        cartDetail.setShoppingCart(cart);

        cart.addCartDetail(cartDetail);
        shoppingCartRepository.save(cart);

        return mapToShoppingCartResponse(cart);
    }

    @Override
    @Transactional
    public ShoppingCartResponse updateCartDetail(String userId, String cartDetailId, CartDetailUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        ShoppingCart cart = shoppingCartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Giỏ hàng không tồn tại"));

        Optional<CartDetail> cartDetailOpt = cart.getCartDetails()
                .stream().filter(cd -> cd.getId().equals(cartDetailId))
                .findFirst();
        if (cartDetailOpt.isPresent()) {
            CartDetail cartDetail = cartDetailOpt.get();

            // Nếu cần kiểm tra số lượng tồn kho khi update, thực hiện tại đây
            Product product = cartDetail.getProduct();
            int currentStock = inventoryService.calculateTotalStock(product.getId());
            product.setStock(currentStock);

            if (product.getStock() < request.getQuantity()) {
                throw new RuntimeException("Sản phẩm không đủ số lượng cập nhật");
            }

            // Cập nhật số lượng (các thuộc tính khác nếu có)
            cartDetail.setQuantity(request.getQuantity());
            // Gọi lại hàm tính tổng trong giỏ hàng
            cart.updateTotal();
            shoppingCartRepository.save(cart);
        } else {
            throw new RuntimeException("Cart Detail không tồn tại trong giỏ hàng");
        }
        return mapToShoppingCartResponse(cart);
    }

    @Override
    @Transactional
    public ShoppingCartResponse removeCartDetail(String userId, String cartDetailId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        ShoppingCart cart = shoppingCartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Giỏ hàng không tồn tại"));

        Optional<CartDetail> cartDetailOpt = cart.getCartDetails()
                .stream().filter(cd -> cd.getId().equals(cartDetailId)).findFirst();
        if (cartDetailOpt.isPresent()) {
            CartDetail cartDetail = cartDetailOpt.get();
            cart.removeCartDetail(cartDetail);
            cartDetailRepository.delete(cartDetail);
        } else {
            throw new RuntimeException("Cart Detail không tồn tại trong giỏ hàng");
        }
        shoppingCartRepository.save(cart);
        return mapToShoppingCartResponse(cart);
    }

    private ShoppingCartResponse mapToShoppingCartResponse(ShoppingCart cart) {
        List<CartDetailResponse> detailResponses = cart.getCartDetails().stream().map(cd ->
                new CartDetailResponse(
                        cd.getId(),
                        cd.getProduct().getId(),
                        cd.getProduct().getName(),
                        cd.getQuantity(),
                        cd.getUnitPrice(),
                        cd.getSubtotal()
                )
        ).collect(Collectors.toList());
        return new ShoppingCartResponse(cart.getId(), detailResponses, cart.getTotal());
    }
}
